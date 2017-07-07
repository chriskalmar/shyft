
export const ATTRIBUTE_NAME_PATTERN = '^[a-zA-Z][a-zA-Z0-9_]*$';
export const attributeNameRegex = new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');


export const storageDataTypeCapabilityType = {
  VALUE: 1,
  LIST: 2,
}

const sdtcVALUE = storageDataTypeCapabilityType.VALUE
const sdtcLIST = storageDataTypeCapabilityType.LIST

export const storageDataTypeCapabilities = {
  in: sdtcLIST,
  lt: sdtcVALUE,
  lte: sdtcVALUE,
  gt: sdtcVALUE,
  gte: sdtcVALUE,
  contains: sdtcVALUE,
  starts_with: sdtcVALUE,
  ends_with: sdtcVALUE,
  not: sdtcVALUE,
  not_in: sdtcLIST,
  not_contains: sdtcVALUE,
  not_starts_with: sdtcVALUE,
  not_ends_with: sdtcVALUE,
}


export default {
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  storageDataTypeCapabilityType,
  storageDataTypeCapabilities,
}
