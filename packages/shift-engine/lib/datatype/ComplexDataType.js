

class ComplexDataType {}


export default ComplexDataType


export const isComplexDataType = (obj) => {
  return (obj instanceof ComplexDataType)
}

