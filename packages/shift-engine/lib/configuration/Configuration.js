
import {
  passOrThrow,
  isArray,
} from '../util';

import {
  isSchema,
} from '../schema/Schema';


class Configuration {

  constructor(setup = {}) {

    const {
      languages,
      schema,
    } = setup

    this.setLanguages(languages || ['en'])

    if (schema) {
      this.setSchema(schema)
    }
  }


  setLanguages (languages) {

    passOrThrow(
      isArray(languages, true),
      () => 'Configuration expects an array of language codes'
    )

    languages.map(language => {
      passOrThrow(
        typeof language === 'string',
        () => 'Configuration expects an array of language codes'
      )
    })

    this.languages = languages
  }

  getLanguages() {
    return this.languages
  }


  setSchema (schema) {
    passOrThrow(
      isSchema(schema),
      () => 'Configuration expects a valid schema'
    )

    this.schema = schema
  }

  getSchema () {
    passOrThrow(
      this.schema,
      () => 'Configuration is missing a valid schema'
    )

    return this.schema
  }
}


export default Configuration


export const isConfiguration = (obj) => {
  return (obj instanceof Configuration)
}

