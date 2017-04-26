
// reserved name of the ID field used by relay
export const RELAY_ID_FIELD = 'id'

// if the model has a field which clashes with the relay ID, use this fallback name
export const FALLBACK_ID_FIELD = '_id'

// use this data field to tell node definitions which type to return
export const RELAY_TYPE_PROMOTER_FIELD = '_type_'

export default {
  RELAY_ID_FIELD,
  FALLBACK_ID_FIELD,
  RELAY_TYPE_PROMOTER_FIELD,
}
