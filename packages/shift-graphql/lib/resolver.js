import {
  addRelayTypePromoterToList,
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



export const resolveByFind = (entity, parentConnection=null) => {

  const storageType = entity.storageType
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  return async (source, args, context, info) => {

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

    const transformedData = transformed

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
