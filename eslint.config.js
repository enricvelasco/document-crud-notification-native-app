// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const stylistic = require('@stylistic/eslint-plugin')
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const importNewlines = require('eslint-plugin-import-newlines')
const tseslint = require('@typescript-eslint/eslint-plugin')
const globals = require('globals')

module.exports = defineConfig([
  globalIgnores([
    'dist/*',
    '.expo/*',
    'node_modules/*',
    'android/*',
    'ios/*',
    '.claude/*',
    '.idea/*',
    '.vscode/*',
    'expo-env.d.ts',
    'scripts/*',
  ]),

  expoConfig,

  {
    plugins: {
      '@stylistic': stylistic,
      'simple-import-sort': simpleImportSort,
      'import-newlines': importNewlines,
    },
    rules: {
      // --- no semicolons ---
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'none' },
        singleline: { delimiter: 'comma', requireLast: false },
      }],

      // --- max 2 parameters per function (core rule; TS-aware override below) ---
      'max-params': ['error', { max: 2 }],

      // --- ordered imports ---
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/order': 'off',
      'sort-imports': 'off',

      // --- an import with more than 3 named elements: one specifier per line ---
      'import-newlines/enforce': ['error', { items: 3 }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/comma-dangle': ['error', {
        imports: 'always-multiline',
        exports: 'always-multiline',
        arrays: 'only-multiline',
        objects: 'only-multiline',
        functions: 'only-multiline',
      }],
      '@stylistic/no-trailing-spaces': 'error',
      // 2-space indent for non-JSX code (keeps wrapped imports aligned);
      // JSX indentation is left to the author to avoid @stylistic/indent's
      // known false positives on nested/conditional JSX.
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 1,
        ignoredNodes: ['JSXElement', 'JSXElement *', 'JSXFragment', 'JSXFragment *'],
      }],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // --- max 2 parameters per function (TS-aware: ignores an explicit `this`) ---
      'max-params': 'off',
      '@typescript-eslint/max-params': ['error', { max: 2 }],

      // --- camelCase, with sensible exceptions ---
      camelcase: 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        // consts can be camelCase, SCREAMING_SNAKE, or PascalCase (arrow-fn components)
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // function declarations may be PascalCase (React components)
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        // types / interfaces / classes / enums
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        // don't police names we don't own
        {
          selector: 'import',
          format: null,
        },
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          format: null,
        },
      ],
    },
  },

  {
    files: ['eslint.config.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
])
