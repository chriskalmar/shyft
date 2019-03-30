module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'eslint:recommended',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
    browser: false,
    jest: true,
  },
  rules: {
    // 'prettier/prettier': [
    //   'error',
    //   {
    //     singleQuote: true,
    //     bracketSpacing: true,
    //   },
    // ],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'no-shadow': 'error',
    'no-shadow-restricted-names': 'error',
    'no-undef': 'error',
    'no-unused-vars': [
      'error',
      {
        vars: 'local',
        args: 'after-used',
      },
    ],
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
      },
    ],
    'no-cond-assign': ['error', 'always'],
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-constant-condition': 1,
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'error',
    'no-ex-assign': 'error',
    'no-extra-boolean-cast': 0,
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-obj-calls': 'error',
    'no-sparse-arrays': 'error',
    'no-unreachable': 'error',
    'use-isnan': 'error',
    'block-scoped-var': 'error',
    'consistent-return': 'error',
    curly: ['error', 'multi-line'],
    'default-case': 'error',
    'dot-notation': [
      2,
      {
        allowKeywords: true,
      },
    ],
    eqeqeq: 'error',
    'guard-for-in': 'error',
    'no-caller': 'error',
    'no-else-return': 'error',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-multi-str': 'error',
    'no-native-reassign': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'error',
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-with': 'error',
    radix: 'error',
    'vars-on-top': 'error',
    'wrap-iife': ['error', 'any'],
    yoda: 'error',
    'brace-style': [
      2,
      'stroustrup',
      {
        allowSingleLine: false,
      },
    ],
    indent: [
      2,
      2,
      {
        SwitchCase: 1,
      },
    ],
    quotes: ['error', 'single', 'avoid-escape'],
    camelcase: [
      2,
      {
        properties: 'never',
      },
    ],
    'comma-spacing': [
      2,
      {
        before: false,
        after: true,
      },
    ],
    'comma-style': ['error', 'last'],
    'eol-last': 'error',
    'func-names': 1,
    'key-spacing': [
      2,
      {
        beforeColon: false,
        afterColon: true,
      },
    ],
    'new-cap': [
      0,
      {
        newIsCap: true,
      },
    ],
    'no-multiple-empty-lines': [
      2,
      {
        max: 3,
      },
    ],
    'no-nested-ternary': 'error',
    'no-new-object': 'error',
    'no-spaced-func': 'error',
    'no-trailing-spaces': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-extra-parens': ['error', 'functions'],
    'no-underscore-dangle': 0,
    'one-var': ['error', 'never'],
    'semi-spacing': [
      2,
      {
        before: false,
        after: true,
      },
    ],
    'array-bracket-spacing': ['error', 'always'],
    'require-jsdoc': 0,
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    // '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
