import util from './util';

describe('util', () => {
  describe('type name', () => {
    it('should generate a type name', () => {
      const result1 = util.generateTypeName('geoCountry');
      const result2 = util.generateTypeName('geo_country');
      const result3 = util.generateTypeName('GEO_COUNTRY');

      expect(result1).toEqual('geoCountry');
      expect(result2).toEqual('geoCountry');
      expect(result3).toEqual('geoCountry');
    });

    it('should generate pascal case type names', () => {
      const result1 = util.generateTypeNamePascalCase('geoCountry');
      const result2 = util.generateTypeNamePascalCase('geo_country');
      const result3 = util.generateTypeNamePascalCase('GEO_COUNTRY');

      expect(result1).toEqual('GeoCountry');
      expect(result2).toEqual('GeoCountry');
      expect(result3).toEqual('GeoCountry');
    });

    it('should generate pluralized type names', () => {
      const result1 = util.generateTypeNamePlural('geoCountry');
      const result2 = util.generateTypeNamePlural('geo_country');
      const result3 = util.generateTypeNamePlural('GEO_COUNTRY');

      expect(result1).toEqual('geoCountries');
      expect(result2).toEqual('geoCountries');
      expect(result3).toEqual('geoCountries');
    });

    it('should generate pluralized pascal case type names', () => {
      const result1 = util.generateTypeNamePluralPascalCase('geoCountry');
      const result2 = util.generateTypeNamePluralPascalCase('geo_country');
      const result3 = util.generateTypeNamePluralPascalCase('GEO_COUNTRY');

      expect(result1).toEqual('GeoCountries');
      expect(result2).toEqual('GeoCountries');
      expect(result3).toEqual('GeoCountries');
    });
  });
});
