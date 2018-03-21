
import {
  passOrThrow,
  isArray,
} from '../util';

import {
  isSchema,
} from '../schema/Schema';

import {
  isProtocolConfiguration,
} from '../protocol/ProtocolConfiguration';


class Configuration {

  constructor(setup = {}) {

    const {
      languages,
      schema,
      protocolConfiguration,
    } = setup

    this.setLanguages(languages || ['en'])

    if (schema) {
      this.setSchema(schema)
    }

    if (protocolConfiguration) {
      this.setProtocolConfiguration(protocolConfiguration)
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


  setProtocolConfiguration (protocolConfiguration) {
    passOrThrow(
      isProtocolConfiguration(protocolConfiguration),
      () => 'Configuration expects a valid protocolConfiguration'
    )

    this.protocolConfiguration = protocolConfiguration
  }

  getProtocolConfiguration () {
    passOrThrow(
      this.protocolConfiguration,
      () => 'Configuration is missing a valid protocolConfiguration'
    )

    return this.protocolConfiguration
  }
}


export default Configuration


export const isConfiguration = (obj) => {
  return (obj instanceof Configuration)
}

