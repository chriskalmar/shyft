export class ComplexDataType {}

export const isComplexDataType = (obj: unknown): obj is ComplexDataType => {
  return obj instanceof ComplexDataType;
};
