import { GraphQLScalarType, GraphQLType } from 'graphql';

//  GraphQLFieldConfig ?
export type DataOutputField = {
  description: string;
  type: GraphQLType;
  resolve?: Function;
};

// // GraphQLOutputFieldConfigMap
export type WrappedDataOutputField = {
  [fieldName: string]: DataOutputField;
};

export type InputFields = {
  clientMutationId?: { type: GraphQLScalarType };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export type OutputFields = {
  clientMutationId?: { type: GraphQLScalarType };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
};

export type ConnectionNode = {
  cursor?: any;
  node?: any;
};
