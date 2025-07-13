module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'react-hooks',
    'import',
  ],
  extends: [
    '@react-native',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // React Native
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',
    'react-native/no-unused-styles': 'off',

    // React
    'react/prop-types': 'off',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.tsx', '.jsx'] },
    ],
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        shorthandFirst: true,
        noSortAlphabetically: false,
        reservedFirst: true,
      },
    ],
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-no-bind': [
      'warn',
      {
        ignoreRefs: true,
        allowArrowFunctions: true,
        allowFunctions: true,
        allowBind: false,
      },
    ],
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: 'parens',
        assignment: 'parens',
        return: 'parens',
        arrow: 'parens',
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    // TypeScript
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-shadow': ['warn'],
    'no-shadow': 'off',
    'no-undef': 'off',

    // General JS
    'no-console': 'warn',
    'no-unused-expressions': 'warn',
    'no-redeclare': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {}, // this tells eslint-plugin-import to use TS paths
    },
  },
};
