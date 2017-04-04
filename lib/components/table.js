
import Component from '../component';
import engine from '../engine';



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


      })

    return builder.toQuery()

  }


}

export default ComponentTable
