

export const passOrThrow = (condition, messageFn) => {
  // providing the error message as a callback return massively improves code coverage reports.
  // the message function is only evaluated if the condition fails, which will show up correctly
  // in the coverage reports.
  if (typeof messageFn !== 'function') {
    throw new Error('passOrThrow() expects messageFn to be a function')
  }
  if (!condition) {
    throw new Error(messageFn())
  }
}


export const resolveFunctionMap = (functionOrMap) => {
  return typeof functionOrMap === 'function'
    ? functionOrMap()
    : functionOrMap
}


export const isMap = (map, nonEmpty) => {
  return map !== null &&
    typeof map === 'object' &&
    Array.isArray(map) === false &&
    (!nonEmpty || (nonEmpty && Object.keys(map).length > 0 ))
}


export const isFunction = (fn) => {
  return typeof fn === 'function'
}



export const isArray = (set, nonEmpty) => {
  return set !== null &&
    Array.isArray(set) === true &&
    (!nonEmpty || (nonEmpty && set.length > 0 ))
}



export const mergeMaps = (first, second) => {
  if (!isMap(first) || !isMap(second)) {
    throw new Error('mergeMaps() expects 2 maps for a merge to work')
  }

  return { ...first, ...second }
}



export const mapOverProperties = (object, iteratee) => {

  passOrThrow(
    isMap(object),
    () => 'Provided object is not a map'
  )

  passOrThrow(
    isFunction(iteratee),
    () => 'Provided iteratee is not a function'
  )


  const keys = Object.keys(object);

  keys.forEach((key) => {
    iteratee(object[ key ], key)
  })
}
