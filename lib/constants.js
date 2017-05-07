
// maximum length for system names (database limitation)
export const SYSTEM_NAME_MAX_LENGTH = 63

// separator when joining multiple sql names
export const SQL_NAME_SEPARATOR = '__'

export const DOMAIN_NAME_MAX_LENGTH = 20
export const ENTITY_NAME_MAX_LENGTH = 40
export const ATTRIBUTE_NAME_MAX_LENGTH = 20
export const SYSTEM_NAME_PATTERN = '^[a-z][a-z0-9_]*$';
export const systemNameRegex = new RegExp(SYSTEM_NAME_PATTERN);


export default {
  SYSTEM_NAME_MAX_LENGTH,
  SQL_NAME_SEPARATOR,
}
