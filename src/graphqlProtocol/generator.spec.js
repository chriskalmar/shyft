import { generateGraphQLSchema } from './generator';
import { generateTestSchema } from './test-helper';

let configuration;

beforeAll(async () => {
  const setup = await generateTestSchema();
  configuration = setup.configuration;
});

describe('generator', () => {
  describe('test', () => {
    it('should render GraphQL Schema', () => {
      const graphqlSchema = generateGraphQLSchema(configuration);
      expect(typeof graphqlSchema).toEqual('object');
      // console.log('graphqlSchema', { graphqlSchema });
      expect(graphqlSchema).toMatchSnapshot();
    });
  });
});
