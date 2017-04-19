
import datatype from './datatype';

import {
  GraphQLInt,
  GraphQLString,
} from 'graphql';



describe('data type', () => {

  it('should convert data types to graphQL types', () => {

    const string = datatype.convertDataTypeToGraphQL('string')
    const integer = datatype.convertDataTypeToGraphQL('integer')

    expect(string).to.equal(GraphQLString);
    expect(integer).to.equal(GraphQLInt);

  })


  it('should fallback to string graphQL type', () => {

    const any = datatype.convertDataTypeToGraphQL('any')

    expect(any).to.equal(GraphQLString);

  })

})
