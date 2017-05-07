
import {
  GraphQLEnumType,
  GraphQLList,
} from 'graphql';

import _ from 'lodash';


export const generateSortInput = (entityModel) => {

  const typeNamePascalCase = entityModel.graphql.typeNamePascalCase

  const sortNames = {}

  _.forEach(entityModel.getAttributes(), (attribute) => {
    const keyAsc = `${_.snakeCase(attribute.name).toUpperCase()}_ASC`
    const keyDesc = `${_.snakeCase(attribute.name).toUpperCase()}_DESC`

    // add ascending key
    sortNames[ keyAsc ] = {
      description: `Order by **\`${attribute.gqlFieldName}\`** ascending`,
      value: {
        attribute: attribute.name,
        direction: 'ASC',
      }
    }

    // add descending key
    sortNames[ keyDesc ] = {
      description: `Order by **\`${attribute.gqlFieldName}\`** descending`,
      value: {
        attribute: attribute.name,
        direction: 'DESC',
      }
    }
  })

  const sortInputType = new GraphQLEnumType({
    name: `${typeNamePascalCase}OrderBy`,
    values: sortNames
  });


  return {
    type: new GraphQLList(sortInputType),
    description: 'Order list by a single or multiple attributes',
    defaultValue: [ sortInputType.getValues()[0].value ],
  }
}
