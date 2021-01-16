import { generateIndexName, quote, SYSTEM_NAME_MAX_LENGTH } from './util';

describe('util', () => {
  describe('quote', () => {
    it('should quote attributes', () => {
      expect(quote('someAttributeName')).toMatchSnapshot();
    });

    it('should quote attributes with JSON pointers', () => {
      expect(quote("someAttributeName->'someProp'")).toMatchSnapshot();
    });

    it('should quote fully qualified attributes', () => {
      expect(quote('someEntity.someAttributeName')).toMatchSnapshot();
    });

    it('should quote fully qualified attributes with JSON pointers', () => {
      expect(
        quote("someEntity.someAttributeName->'someProp'"),
      ).toMatchSnapshot();
    });
  });

  describe('generateIndexName', () => {
    it('should generate index names', () => {
      expect(
        generateIndexName('some_entity', ['first_name', 'last_name']),
      ).toMatchSnapshot();
    });

    it('should generate unique index names based on attribute order', () => {
      expect(
        generateIndexName('some_entity', ['last_name', 'first_name']),
      ).toMatchSnapshot();
    });

    it('should generate index with custom suffix', () => {
      expect(
        generateIndexName(
          'some_entity',
          ['last_name', 'first_name'],
          'my_suffix',
        ),
      ).toMatchSnapshot();
    });

    it(`should limit the total index name length to SYSTEM_NAME_MAX_LENGTH (${SYSTEM_NAME_MAX_LENGTH})`, () => {
      const name = generateIndexName('some_entity', [
        'first_name',
        'last_name',
        'very_long_attribute_name',
        'even_longer_attribute_name',
      ]);

      expect(name.length).toEqual(SYSTEM_NAME_MAX_LENGTH);
    });
  });
});
