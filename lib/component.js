

class Component {

  constructor (name) {

    if (!name) {
      throw new Error('Missing component name')
    }

    this.name = name

  }


  getName () {
    return this.name
  }


  generateSql () {
    throw new Error(`Missing implementation of generateSql() for component '${this.name}'`)
  }

}


export default Component
