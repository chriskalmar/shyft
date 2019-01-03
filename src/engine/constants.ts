export const ATTRIBUTE_NAME_PATTERN = '^[a-zA-Z][a-zA-Z0-9_]*$';
export const attributeNameRegex = new RegExp(ATTRIBUTE_NAME_PATTERN);

export const ENUM_VALUE_PATTERN = '^[_a-zA-Z][_a-zA-Z0-9]*$';
export const enumValueRegex = new RegExp(ENUM_VALUE_PATTERN);

export const STATE_NAME_PATTERN = '^[a-zA-Z][_a-zA-Z0-9]*$';
export const stateNameRegex = new RegExp(STATE_NAME_PATTERN);

export const LANGUAGE_ISO_CODE_PATTERN = '^[a-z]+$';
export const languageIsoCodeRegex = new RegExp(LANGUAGE_ISO_CODE_PATTERN);

export const storageDataTypeCapabilityType = {
  VALUE: 1,
  LIST: 2,
};

const sdtcVALUE = storageDataTypeCapabilityType.VALUE;
const sdtcLIST = storageDataTypeCapabilityType.LIST;

export const storageDataTypeCapabilities = {
  in: sdtcLIST,
  lt: sdtcVALUE,
  lte: sdtcVALUE,
  gt: sdtcVALUE,
  gte: sdtcVALUE,
  contains: sdtcVALUE,
  starts_with: sdtcVALUE,
  ends_with: sdtcVALUE,
  ne: sdtcVALUE,
  not_in: sdtcLIST,
  not_contains: sdtcVALUE,
  not_starts_with: sdtcVALUE,
  not_ends_with: sdtcVALUE,
};

export const entityPropertiesWhitelist: Array<string> = [
  'name',
  'description',
  'attributes',
  'attributesGenerator',
  'storageType',
  'isUserEntity',
  'includeTimeTracking',
  'includeUserTracking',
  'indexes',
  'mutations',
  'permissions',
  'states',
  'postProcessor',
  'preFilters',
  'preFiltersGenerator',
  'meta',
];

export const attributePropertiesWhitelist: Array<string> = [
  'name',
  'description',
  'type',
  'required',
  'primary',
  'unique',
  'index',
  'resolve',
  'defaultValue',
  'serialize',
  'validate',
  'hidden',
  'i18n',
  'mock',
  'mutationInput',
  'meta',
];
