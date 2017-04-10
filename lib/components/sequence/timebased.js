
import Component from '../../component';
import engine from '../../engine';

class ComponentSequenceTimebased extends Component {

  constructor () {
    super('sequence/timebased')
  }


  generateSql (entityModel) {

    return ComponentSequenceTimebased.template({
      domain: engine.getSqlSchemaName(entityModel),
      entity: entityModel.name
    })

  }


  static template = engine.loadTemplate(`${__dirname}/timebased.tpl.sql`);

}

export default ComponentSequenceTimebased
