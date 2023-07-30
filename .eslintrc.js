module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['prettier', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/naming-convention': 'warn',
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/no-non-null-assertion': ['error'],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'never',
      },
    ],
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': false,
        },
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    curly: 'warn',
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    semi: 'off',
    'sort-imports': 0,
    'object-shorthand': ['error', 'always'],
    'no-restricted-imports': [
      'error',
      {
        patterns: ['@mui/*', 'libs/*', 'apps/*', '**/*/src'],
      },
    ],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'info', 'debug'],
      },
    ],
    'no-debugger': 'error',
    'no-unneeded-ternary': 'error',
    'no-void': 'error',
  },
  ignorePatterns: ['node_modules', 'out', 'dist', '**/*.d.ts'],
}
