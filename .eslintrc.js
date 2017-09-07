module.exports = {
  parser: 'babel-eslint', // Allows us to use all the awesome es6/es7 features that aren't yet supported natively in eslint
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true
  },
  globals: {
    lazy: true,
    subject: true
  },
  plugins: ['mocha'],
  extends: [
    // 'eslint:recommended',
  ],
  rules: {
    // Best Practices
    'no-return-await': 'warn',

    // Stylistic Issues
    'comma-dangle': ['error', 'never'],
    curly: 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    'max-len': [
      'error',
      120,
      2,
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'one-var-declaration-per-line': ['error', 'initializations'],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: 'error',

    // Plugins
    'mocha/no-exclusive-tests': 'error',

    // All of the rules below are part of eslint:recommended
    // see http://eslint.org/docs/rules/
    //
    // * existing rules have kept the same severity level
    // * new rules with no violations have been given warning severity
    // * new rules with violations that require notable effort to fix have been disabled

    // Possible Errors
    'no-compare-neg-zero': 'off',
    'no-cond-assign': 'warn',
    'no-console': 'off',
    'no-constant-condition': 'off',
    'no-control-regex': 'warn',
    'no-debugger': 'error',
    'no-dupe-args': 'warn',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'off',
    'no-empty': 'warn',
    'no-empty-character-class': 'warn',
    'no-ex-assign': 'warn',
    'no-extra-boolean-cast': 'off',
    'no-extra-semi': 'off',
    'no-func-assign': 'warn',
    'no-inner-declarations': 'off',
    'no-invalid-regexp': 'warn',
    'no-irregular-whitespace': 'off',
    'no-obj-calls': 'off',
    'no-regex-spaces': 'warn',
    'no-sparse-arrays': 'warn',
    'no-unexpected-multiline': 'off',
    'no-unreachable': 'warn',
    'no-unsafe-finally': 'off',
    'no-unsafe-negation': 'off',
    'use-isnan': 'warn',
    'valid-typeof': 'warn',

    // Best Practices
    'no-case-declarations': 'off',
    'no-empty-pattern': 'off',
    'no-fallthrough': 'off',
    'no-global-assign': 'off',
    'no-octal': 'off',
    'no-redeclare': 'warn',
    'no-self-assign': 'warn',
    'no-unused-labels': 'off',
    'no-useless-escape': 'off',

    // Variables
    'no-delete-var': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',

    // Stylistic Issues
    'no-mixed-spaces-and-tabs': 'off',

    // ECMAScript 6
    'constructor-super': 'off',
    'no-class-assign': 'off',
    'no-const-assign': 'off',
    'no-dupe-class-members': 'off',
    'no-new-symbol': 'off',
    'no-this-before-super': 'off',
    'require-yield': 'off'
  }
};
