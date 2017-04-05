

class Component {

  constructor (name) {

    if (!name) {
      throw new Error('Missing component name')
    }

    // set name of the component
    this.name = name

  }


  getName () {
    return this.name
  }


  // function for generating the components SQL
  generateSql () {
    throw new Error(`Missing implementation of generateSql() for component '${this.name}'`)
  }

}


export default Component
