import _ from 'lodash';
import { CommandUtils } from 'typeorm/commands/CommandUtils';

import format from 'prettier-eslint';
import {
  connectStorage,
  getConnection,
  disconnectStorage,
} from '../lib/generator';

const getTemplate = (migrationName, timestamp, upSqls, downSqls) => {
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

const upgradeMigrationQuery = _query => {
  const sqls = [];
  const query = _query.replace(new RegExp('`', 'g'), '\\`');

  const match = query.match(/ALTER TABLE "(\w+)" ADD "(\w+)" (.+) NOT NULL/);
  if (match) {
    const [ , table, attribute, _type ] = match;

    const type = _type.toLowerCase();
    let defaultValue;

    // user tracking
    if ([ 'created_by', 'updated_by' ].includes(attribute)) {
      defaultValue = 'get_machine_user()';
    }
    // time tracking
    else if ([ 'created_at', 'updated_at' ].includes(attribute)) {
      defaultValue = 'NOW()';
    }
    // general type based default values
    else if (type.includes('timestamp')) {
      defaultValue = 'NOW()';
    }
    else if (type.includes('bigint')) {
      defaultValue = '0';
    }
    else if (type.includes('integer')) {
      defaultValue = '0';
    }
    else if (type.includes('numeric')) {
      defaultValue = '0.0';
    }
    else if (type.includes('boolean')) {
      defaultValue = false;
    }
    else if (type.includes('json') || type.includes('jsonb')) {
      defaultValue = '{}';
    }
    else {
      throw new Error(`Cannot handle column addition default for: ${query}`);
    }

    sqls.push(
      `    await queryRunner.query('${query} DEFAULT ${defaultValue}');`,
    );

    sqls.push(
      `    await queryRunner.query('ALTER TABLE "${table}" ALTER COLUMN "${attribute}" DROP DEFAULT');`,
    );
  }
  else {
    const reformatted = query
      .replace(new RegExp('`', 'g'), '\\`')
      .replace(new RegExp("'", 'g'), "\\'");
    sqls.push(`    await queryRunner.query('${reformatted}');`);
  }

  return sqls;
};

export const generateMigration = async (configuration, migrationName) => {
  await connectStorage(configuration, false);
  const connection = getConnection();
  const storageConfiguration = configuration.getStorageConfiguration();
  const manager = connection.manager;

  const upSqls = [];
  const downSqls = [];

  const i18nMigrations = await storageConfiguration.generateI18nIndicesMigration(
    configuration,
    manager,
  );

  i18nMigrations.upQueries.forEach(query => {
    upgradeMigrationQuery(query).map(sql => upSqls.push(sql));
  });

  i18nMigrations.downQueries.forEach(query => {
    upgradeMigrationQuery(query).map(sql => downSqls.push(sql));
  });

  const sqlInMemory = await connection.driver.createSchemaBuilder().log();

  sqlInMemory.upQueries.forEach(query => {
    upgradeMigrationQuery(query).map(sql => upSqls.push(sql));
  });

  sqlInMemory.downQueries.forEach(query => {
    upgradeMigrationQuery(query).map(sql => downSqls.push(sql));
  });

  if (upSqls.length || downSqls.length) {
    if (!migrationName) {
      throw new Error('Error: Please specify a migration name');
    }

    const timestamp = new Date().getTime();

    const filename = `${timestamp}-${_.camelCase(migrationName)}.js`;

    const fileContent = getTemplate(
      migrationName,
      timestamp,
      upSqls,
      downSqls.reverse(),
    );

    const path = `${process.cwd()}/migrations/${filename}`;

    const formatted = format({
      text: fileContent,
      prettierOptions: {
        parser: 'babylon',
        singleQuote: true,
        trailingComma: 'all',
        printWidth: 80,
        bracketSpacing: true,
      },
    });

    await CommandUtils.createFile(path, formatted);

    console.log(`Migration file '${path}' has been generated successfully.`);
  }
  else {
    console.log('No changes were found in database schema.');
  }

  await disconnectStorage(configuration);
};
