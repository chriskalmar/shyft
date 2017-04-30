
import {
  GraphQLEnumType,
  GraphQLList,
} from 'graphql';


export const generateSortInput = (entityModel) => {

  const typeNameUpperCase = entityModel.gqlTypeNameUpperCase

  const sortNames = {}

  entityModel.attributes.map( (attribute) => {
    const keyAsc = `${attribute.name.toUpperCase()}_ASC`
    const keyDesc = `${attribute.name.toUpperCase()}_DESC`

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
    name: `${typeNameUpperCase}OrderBy`,
    values: sortNames
  });


  return {
    type: new GraphQLList(sortInputType),
    description: 'Order list by a single or multiple attributes',
    defaultValue: [ sortInputType.getValues()[0].value ],
  }
}
