
import Component from '../component';
import _ from 'lodash';

class ComponentSchema extends Component {

  constructor () {
    super('schema')
  }


  generateSql (schemaNames) {

    // generate sql for each schema
    return schemaNames.map((domain) => {
      return ComponentSchema.template({domain})
    }).join('')

  }


  static template = _.template(`
    CREATE SCHEMA IF NOT EXISTS <%= domain %>;
  `)


}

export default ComponentSchema
