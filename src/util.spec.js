import { quote } from './util';

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
});
