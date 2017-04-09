
import Component from '../component';
import engine from '../engine';
import registry from '../registry';
import _ from 'lodash';


const knex = require('knex')({
  client: 'pg'
})


class ReferenceTable extends Component {

  constructor () {
    super('reference')
  }


  generateSql (entityModel) {

    const builder = knex.schema

    builder.withSchema(engine.getSqlSchemaName(entityModel))

      // select table
      .table(entityModel.name, (table) => {

        // find fields with references
        entityModel.attributes.map((attribute) => {

          if (attribute.target) {
            const targetStructurePath = engine.convertTargetToPath(attribute.target, entityModel.domain, entityModel.provider)

            const targetEntityModel = registry.getProviderEntityModelFromPath(targetStructurePath)

            // generate structure path from target
            const foreignTable = engine.convertPathToSql( targetStructurePath )

            // multi-key reference
            if (attribute.targetAttributesMap) {
              const foreignAttributeNames = _.values( attribute.targetAttributesMap )
              const localAttributeNames = _.keys( attribute.targetAttributesMap )

              // generate index name
              const indexName = engine.generateIndexName(entityModel.name, localAttributeNames, engine.indexTypes.FOREIGN)

              const ref = table
                .foreign(localAttributeNames, indexName)
                .references(foreignAttributeNames)
                .inTable(foreignTable)

              // disable cascading if set in foreign table
              if (!targetEntityModel.noCascade) {
                ref
                  .onDelete('cascade')
                  .onUpdate('cascade')
              }
            }
            // single-key reference
            else {
              // generate index name
              const indexName = engine.generateIndexName(entityModel.name, [ attribute.name ], engine.indexTypes.FOREIGN)

              const ref = table
                .foreign(attribute.name, indexName)
                .references('id')
                .inTable(foreignTable)

              // disable cascading if set in foreign table
              if (!targetEntityModel.noCascade) {
                ref
                  .onDelete('cascade')
                  .onUpdate('cascade')
              }
            }
          }

        })

      })


    return builder.toQuery()

  }


}

export default ReferenceTable
