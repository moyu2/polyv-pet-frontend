/* eslint-env node */

module.exports = {
  root: true,
  extends: [
    './node_modules/@polyv/eslint-config/lib/for-vue2-js',
    './node_modules/@polyv/eslint-config/lib/for-ts',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    PROJECT_BUILD_TIME: 'readonly',
    PROJECT_VERSION: 'readonly',
    WATCH_SDK_ENV: 'readonly',
    IN_SDK_INJECT_MODE: 'readonly',
    ENABLE_RUNTIME_PUBLIC_PATH: 'readonly',
    BUILD_ENV: 'readonly',
    NEED_INTERNAL_BUILD_VUE: 'readonly',
    RUM_ENABLED: 'readonly',
  },
  rules: {
    'import/named': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'promise/prefer-await-to-then': 'off',
    '@typescript-eslint/no-for-in-array': 'off',

    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'enumMember',
        format: ['PascalCase', 'UPPER_CASE'],
      },
    ],
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      {
        registeredComponentsOnly: true,
        ignores: [],
      },
    ],

    'vue/enforce-style-attribute': ['warn', { allow: ['plain'] }],
  },
};
