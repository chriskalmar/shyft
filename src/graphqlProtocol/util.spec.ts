/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  generateTypeName,
  generateTypeNamePascalCase,
  generateTypeNamePlural,
  generateTypeNamePluralPascalCase,
} from './util';

describe('util', () => {
  describe('type name', () => {
    it('should generate a type name', () => {
      const result1 = generateTypeName('geoCountry');
      const result2 = generateTypeName('geo_country');
      const result3 = generateTypeName('GEO_COUNTRY');

      expect(result1).toEqual('geoCountry');
      expect(result2).toEqual('geoCountry');
      expect(result3).toEqual('geoCountry');
    });

    it('should generate pascal case type names', () => {
      const result1 = generateTypeNamePascalCase('geoCountry');
      const result2 = generateTypeNamePascalCase('geo_country');
      const result3 = generateTypeNamePascalCase('GEO_COUNTRY');

      expect(result1).toEqual('GeoCountry');
      expect(result2).toEqual('GeoCountry');
      expect(result3).toEqual('GeoCountry');
    });

    it('should generate pluralized type names', () => {
      const result1 = generateTypeNamePlural('geoCountry');
      const result2 = generateTypeNamePlural('geo_country');
      const result3 = generateTypeNamePlural('GEO_COUNTRY');

      expect(result1).toEqual('geoCountries');
      expect(result2).toEqual('geoCountries');
      expect(result3).toEqual('geoCountries');
    });

    it('should generate pluralized pascal case type names', () => {
      const result1 = generateTypeNamePluralPascalCase('geoCountry');
      const result2 = generateTypeNamePluralPascalCase('geo_country');
      const result3 = generateTypeNamePluralPascalCase('GEO_COUNTRY');

      expect(result1).toEqual('GeoCountries');
      expect(result2).toEqual('GeoCountries');
      expect(result3).toEqual('GeoCountries');
    });
  });
});
