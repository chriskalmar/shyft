
import {
  passOrThrow,
  isArray,
} from '../util';


class Configuration {

  constructor(setup = {}) {

    const {
      languages,
    } = setup

    this.setLanguages(languages || ['en'])
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

}


export default Configuration


export const isConfiguration = (obj) => {
  return (obj instanceof Configuration)
}

