
import Component from '../component';
import engine from '../engine';
import registry from '../registry';


const knex = require('knex')({
  client: 'pg'
})

class ComponentTable extends Component {

  constructor () {
    super('table')
  }


  generateSql (entityModel) {


    const builder = knex.schema

    builder.withSchema(engine.getSqlSchemaName(entityModel))

      // create table
      .createTable(entityModel.name, (table) => {

        // add table comment
        table.comment(entityModel.description)

        // define primary id
        table.increments('id').primary()

        // add timestamp columns
        table.timestamps(true, true);

        // create fields
        entityModel.attributes.map((attribute) => {
          // load data type definition
          const dataType = registry.getDataType(attribute.type)

          // create field with comment
          const column = table
            .specificType(attribute.name, dataType.dbType)
            .comment(attribute.description.replace('\'', '\'\''));

          // make it required if set
          ( attribute.required && column.notNullable() )
        })


        // add uniqueness contraints
        if (entityModel.indexing && entityModel.indexing.unique) {
          entityModel.indexing.unique.map((attributes) => {
            table.unique(attributes, engine.generateIndexName(entityModel.name, attributes, engine.indexTypes.UNIQUE))
          })
        }
      })

    return builder.toQuery()

  }


}

export default ComponentTable
