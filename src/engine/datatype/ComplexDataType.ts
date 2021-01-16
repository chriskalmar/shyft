export class ComplexDataType {}

export const isComplexDataType = (obj: any): boolean => {
  return obj instanceof ComplexDataType;
};
