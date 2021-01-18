module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  // transformIgnorePatterns: [ '/node_modules/', '^.+\\.js?$' ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
