import casual from 'casual';
import _ from 'lodash';



export const deleteUndefinedProps = (obj) =>
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])



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
    : { ...functionOrMap }
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


export const isString = (str) => (typeof str === 'string')


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



export const sortDataByKeys = (keys, data, keyProperty='id') => {
  const map = {}
  const result = []
  const order = {}

  if (!keys || ( isArray(keys) && keys.length === 0)) {
    return []
  }

  if (!data || ( isArray(data) && data.length === 0)) {
    return keys.map(() => null)
  }


  for (let d = 0; d < data.length; d++) {
    const row = data[ d ]
    const id = row[ keyProperty ]
    const found = map[id]

    if (!found) {
      map[id] = row
    }
    else if (found instanceof Array) {
      found.push(row)
    }
    else {
      map[id] = [ found, row ];
    }
  }


  for (let k = 0; k < keys.length; k++) {
    const key = keys[ k ]
    const found = map[ key ];

    if (typeof found === 'undefined') {
      result.push(null)
    }
    else if (found instanceof Array) {
      let idx = order[ key ];

      if (typeof idx === 'undefined') {
        idx = 0
      }
      else {
        idx++
      }

      order[ key ] = idx;

      result.push(found[ idx ]);
    }
    else {
      result.push(found);
    }
  }

  return result;
};



export const processCursor = (entity, cursor, orderBy, reverse) => {

  const $LT = reverse ? '$gt' : '$lt'
  const $GT = reverse ? '$lt' : '$gt'
  const $LTE = reverse ? '$gte' : '$lte'
  const $GTE = reverse ? '$lte' : '$gte'

  const where = {}

  if (cursor) {
    passOrThrow(
      isArray(cursor[ entity.name ]),
      () => 'Incompatible cursor for this entity'
    )

    passOrThrow(
      isArray(orderBy),
      () => 'orderBy needs to be an array of order definitions'
    )

    const orderList = []

    const orderMap = {}
    orderBy.map(({attribute, direction}) => {

      passOrThrow(
        attribute && direction,
        () => 'orderBy needs to be an array of attributes and respective sort order'
      )

      orderMap[ attribute ] = direction
    })

    const primaryAttribute = entity.getPrimaryAttribute()
    const attributes = entity.getAttributes()

    let foundUniqueAttribute = false

    cursor[ entity.name ].map(filter => {
      if (filter.length !== 2) {
        throw new Error('Cursor malformed')
      }

      const attributeName = filter[0]

      passOrThrow(
        attributes[ attributeName ],
        () => `Unknown attribute '${attributeName}' used in cursor`
      )

      if (attributeName !== primaryAttribute.name) {
        passOrThrow(
          orderMap[ attributeName ],
          () => `Cursor works only on sorted attributes (check: '${attributeName}')`
        )
      }

      const attribute = attributes[ attributeName ]

      // limit where clause to the first attribute which is defined as unique
      if (!foundUniqueAttribute) {
        orderList.push(attributeName)
      }

      if (attribute.isUnique) {
        foundUniqueAttribute = true
      }

    })

    passOrThrow(
      foundUniqueAttribute,
      () => 'Cursor needs to have at least one attribute defined as unique'
    )


    // if more than 2 attributes are used for the cursor take only the first and the last (primary key)
    if (orderList.length > 2) {
      orderList.splice(1, (orderList.length - 2) )
    }


    // simple filter for single attributes
    if (orderList.length === 1) {

      const attributeName = orderList[0]
      const value = cursor[ entity.name ][0][1]

      if (orderMap[ attributeName ] === 'DESC') {
        where[ attributeName ] = {
          [ $LT ]: value
        }
      }
      else {
        where[ attributeName ] = {
          [ $GT ]: value
        }
      }

    }
    else {
      where.$not = {}

      cursor[ entity.name ].map(filter => {
        const attributeName = filter[0]
        const value = filter[1]

        // ignore attributes that obsolete due to prior unique attribute
        if (orderList.indexOf(attributeName) === -1) {
          return
        }

        const attribute = attributes[ attributeName ]

        if (attribute.isUnique) {
          if (orderMap[ attributeName ] === 'DESC') {
            where.$not[ attributeName ] = {
              [ $GTE ]: value
            }
          }
          else {
            where.$not[ attributeName ] = {
              [ $LTE ]: value
            }
          }
        }
        else {
          where.$not[ attributeName ] = value

          if (orderMap[ attributeName ] === 'DESC') {
            where[ attributeName ] = {
              [ $LTE ]: value
            }
          }
          else {
            where[ attributeName ] = {
              [ $GTE ]: value
            }
          }
        }

      })
    }
  }

  return where
}


export const processCursors = (entity, args) => {

  const {
    after,
    before,
  } = args;

  const where = {
    $and: [
      processCursor(entity, after, args.orderBy),
      processCursor(entity, before, args.orderBy, true),
    ]
  }

  return where
}



export const reverseString = (str) => {
  return str
    .split('')
    .reverse()
    .join('');
}



export const randomJson = () => {
  const ret = {}
  const count = casual.integer(1, 5)

  _.times(count, () => {
    const key = _.camelCase(casual.words(2))
    const value = Math.random() > 0.5
      ? casual.title
      : casual.integer()

    ret[key] = value
  })

  return ret
}
