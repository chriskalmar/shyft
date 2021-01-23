import * as _ from 'lodash';
import * as path from 'path';
import { CommandUtils } from 'typeorm/commands/CommandUtils';
import { MigrationExecutor } from 'typeorm/migration/MigrationExecutor';

import format from 'prettier-eslint';
import { connectStorage, getConnection, disconnectStorage } from './generator';
import { asyncForEach } from './util';

const defaultTemplate = (migrationName, timestamp, upSqls, downSqls) => {
  return `
export class ${_.camelCase(migrationName)}${timestamp} {
  async up(queryRunner) {
${upSqls.join('\n')}
  }

  async down(queryRunner) {
${downSqls.join('\n')}
  }
}
`;
};

const upgradeMigrationQuery = (_query, isUpMigration = false) => {
  const sqls = [];
  const query = _query.query.replace(new RegExp('`', 'g'), '\\`');
  const parameters = _query.parameters ? JSON.stringify(_query.parameters) : '';

  const match = query.match(/ALTER TABLE "(\w+)" ADD "(\w+)" (.+) NOT NULL/);
  if (match) {
    const [, table, attribute, _type] = match;

    const type = _type.toLowerCase();
    let defaultValue;

    // user tracking
    if (['created_by', 'updated_by'].includes(attribute)) {
      defaultValue = 'get_machine_user()';
    }
    // time tracking
    else if (['created_at', 'updated_at'].includes(attribute)) {
      defaultValue = 'NOW()';
    }
    // general type based default values
    else if (type.includes('timestamp')) {
      defaultValue = 'NOW()';
    } else if (type.includes('time')) {
      defaultValue = 'NOW()';
    } else if (type.includes('date')) {
      defaultValue = 'NOW()';
    } else if (type.includes('bigint')) {
      defaultValue = '0';
    } else if (type.includes('integer')) {
      defaultValue = '0';
    } else if (type.includes('numeric')) {
      defaultValue = '0.0';
    } else if (type.includes('boolean')) {
      defaultValue = false;
    } else if (type.includes('json') || type.includes('jsonb')) {
      defaultValue = "\\'{}\\'";
    } else if (type.includes('text')) {
      defaultValue = "\\'\\'";
    } else {
      throw new Error(`Cannot handle column addition default for: ${query}`);
    }

    const addColumnQuery = `    await queryRunner.query('${query} DEFAULT ${defaultValue}');`;
    const dropDefaultQuery = `    await queryRunner.query('ALTER TABLE "${table}" ALTER COLUMN "${attribute}" DROP DEFAULT');`;

    if (isUpMigration) {
      sqls.push(addColumnQuery);
      sqls.push(dropDefaultQuery);
    } else {
      sqls.push(dropDefaultQuery);
      sqls.push(addColumnQuery);
    }
  } else {
    const reformatted = query
      .replace(new RegExp('`', 'g'), '\\`')
      .replace(new RegExp("'", 'g'), "\\'");
    sqls.push(
      `    await queryRunner.query(\`${reformatted}\`, ${parameters});`,
    );
  }

  return sqls;
};

const getMigrationsFullPath = (connectionConfig) => {
  if (connectionConfig.migrations && connectionConfig.migrations[0]) {
    return path.dirname(
      connectionConfig.migrations[0].indexOf('/') === 0
        ? connectionConfig.migrations[0]
        : path.join(process.cwd(), connectionConfig.migrations[0]),
    );
  }

  return path.join(process.cwd(), 'migrations');
};

export const generateMigration = async (
  configuration,
  migrationName,
  customTemplate,
  includeI18n = false,
  enforce = false,
): Promise<number | null> => {
  await connectStorage(configuration, false);
  const connection = getConnection();
  const storageConfiguration = configuration.getStorageConfiguration();
  const manager = connection.manager;
  const connectionConfig = storageConfiguration.getConnectionConfig();

  const migrationsPath = getMigrationsFullPath(connectionConfig);
  const timestamp: number = new Date().getTime();

  const upSqls = [];
  const downSqls = [];

  if (includeI18n) {
    const i18nMigrations = await storageConfiguration.generateI18nIndicesMigration(
      configuration,
      manager,
    );

    i18nMigrations.upQueries.forEach((query) => {
      upgradeMigrationQuery({ query }, true).map((sql) => upSqls.push(sql));
    });

    i18nMigrations.downQueries.forEach((query) => {
      upgradeMigrationQuery({ query }, false).map((sql) => downSqls.push(sql));
    });
  }

  const sqlInMemory = await connection.driver.createSchemaBuilder().log();

  sqlInMemory.upQueries.forEach((query) => {
    upgradeMigrationQuery(query, true).map((sql) => upSqls.push(sql));
  });

  sqlInMemory.downQueries.forEach((query) => {
    upgradeMigrationQuery(query, false).map((sql) => downSqls.push(sql));
  });

  if (upSqls.length || downSqls.length || enforce) {
    if (!migrationName) {
      throw new Error('Error: Please specify a migration name');
    }

    const filename = `${timestamp}-${_.camelCase(migrationName)}.js`;

    const template = customTemplate || defaultTemplate;
    const fileContent = template(
      migrationName,
      timestamp,
      upSqls,
      downSqls.reverse(),
    );

    const migrationPath = path.join(migrationsPath, filename);

    const formatted = format({
      text: fileContent,
      filePath: migrationPath,
    });

    await CommandUtils.createFile(migrationPath, formatted);

    console.log(
      `Migration file '${migrationPath}' has been generated successfully.`,
    );
  } else {
    console.log('No changes were found in database schema.');
  }

  await disconnectStorage(configuration);
  return upSqls.length || downSqls.length || enforce ? timestamp : null;
};

export const runMigration = async (configuration) => {
  await connectStorage(configuration, false);
  const connection = getConnection();

  try {
    await connection.runMigrations({
      transaction: 'each',
    });
  } catch (err) {
    console.error('Migration failed');
    console.error(err);
    await disconnectStorage(configuration);
    process.exit(1);
  }

  await disconnectStorage(configuration);
};

export const revertMigration = async (configuration) => {
  await connectStorage(configuration, false);
  const connection = getConnection();

  try {
    await connection.undoLastMigration({
      transaction: 'each',
    });
  } catch (err) {
    console.error('Migration reversion failed');
    console.error(err);
    await disconnectStorage(configuration);
    process.exit(1);
  }

  await disconnectStorage(configuration);
};

export const fillMigrationsTable = async () => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  const migrationExecutor = new MigrationExecutor(connection);
  await migrationExecutor.createMigrationsTableIfNotExist(queryRunner);
  const allMigrations = migrationExecutor.getMigrations();

  await asyncForEach(allMigrations, async (migration) => {
    await migrationExecutor.insertExecutedMigration(queryRunner, migration);
  });
};

export const migrateI18nIndices = async (configuration) => {
  await connectStorage(configuration, false);
  const connection = getConnection();
  const storageConfiguration = configuration.getStorageConfiguration();
  const manager = connection.manager;
  const queryRunner = connection.createQueryRunner();

  try {
    const {
      upQueries,
    } = await storageConfiguration.generateI18nIndicesMigration(
      configuration,
      manager,
    );

    if (upQueries.length) {
      await queryRunner.startTransaction();

      await asyncForEach(
        upQueries,
        async (query) => await queryRunner.query(query),
      );

      await queryRunner.commitTransaction();
    }
  } catch (err) {
    console.error('I18n migration failed');
    console.error(err);
    await disconnectStorage(configuration);
    process.exit(1);
  }

  await disconnectStorage(configuration);
};
