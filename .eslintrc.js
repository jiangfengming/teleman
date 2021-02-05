module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',

  plugins: [
    'ext',
    '@typescript-eslint'
  ],

  extends: [
    'enough',
    'plugin:@typescript-eslint/recommended'
  ],

  env: {
    node: true,
    browser: true,
    mocha: true
  },

  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],

      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-var-requires': 'error'
      }
    }
  ],

  rules: {
    'ext/lines-between-object-properties': ['error', 'always', { exceptBetweenSingleLines: true }],
    'no-extra-parens': 'off',
    '@typescript-eslint/no-extra-parens': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off'
  }
};
