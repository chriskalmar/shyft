

// name a provider for local entities
export const localProviderName = '@'

// maximum length for system names (database limitation)
export const SYSTEM_NAME_MAX_LENGTH = 63

// separator when joining multiple sql names
export const SQL_NAME_SEPARATOR = '__'

// path sign for defining targets (provider, domain, entity, ...)
export const PATH_SIGN = '::'


export default {
  localProviderName,
  SYSTEM_NAME_MAX_LENGTH,
  SQL_NAME_SEPARATOR,
  PATH_SIGN
}
