import {
  addRelayTypePromoterToList,
  addRelayTypePromoterToInstanceFn,
  translateList,
} from './util';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  validateConnectionArgs,
  forceSortByUnique,
  connectionFromData,
} from './connection';

import {
  transformFilterLevel,
} from './filter';



export const resolveByFind = (entity, parentConnectionCollector) => {

  const storageType = entity.storageType
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  return async (source, args, context, info) => {

    const parentConnection = parentConnectionCollector
      ? parentConnectionCollector({ source, args, context, info })
      : null

    validateConnectionArgs(source, args, context, info)
    forceSortByUnique(args.orderBy, entity)

    args.filter = await transformFilterLevel(args.filter, entity.getAttributes(), context)

    const {
      data,
      pageInfo,
    } = await storageType.find(entity, args, context, parentConnection)

    const transformed = entity.graphql.dataSetShaper(
      addRelayTypePromoterToList(
        protocolConfiguration.generateEntityTypeName(entity),
        data
      )
    )

    const translated = translateList(entity, transformed, context)
    const transformedData = translated

    return connectionFromData(
      {
        transformedData,
        originalData: data,
      },
      entity,
      source,
      args,
      context,
      info,
      parentConnection,
      pageInfo,
    )
  }
}



export const resolveByFindOne = (entity, idCollector) => {

  const storageType = entity.storageType
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  return async (source, args, context) => {

    const id = idCollector({ source, args, context })

    if (id === null || typeof id === 'undefined') {
      return Promise.resolve(null)
    }

    return storageType.findOne(entity, id, args, context)
      .then(
        addRelayTypePromoterToInstanceFn(
          protocolConfiguration.generateEntityTypeName(entity)
        )
      )
      .then(entity.graphql.dataShaper)
  }
}
