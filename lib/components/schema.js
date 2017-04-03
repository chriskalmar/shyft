
import Component from '../component';
import _ from 'lodash';

class ComponentSchema extends Component {

  constructor () {
    super('schema')
  }


  generateSql (entityModels) {

    // get unique list of domains and generate sql
    return _.chain(entityModels)
      .map( ({domain}) => domain )
      .uniq()
      .value()
      .map((domain) => {
        return ComponentSchema.template({domain})
      })
      .join('')

  }


  static template = _.template(`
    CREATE SCHEMA IF NOT EXISTS <%= domain %>;
  `)


}

export default ComponentSchema
