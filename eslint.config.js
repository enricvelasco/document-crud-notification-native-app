// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const stylistic = require('@stylistic/eslint-plugin')
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const importNewlines = require('eslint-plugin-import-newlines')
const tseslint = require('@typescript-eslint/eslint-plugin')
const globals = require('globals')
const { readImportAliasRoots } = require('./scripts/import-aliases')

// Project import aliases (`@core`, `@hooks`, …) look exactly like scoped npm
// packages, so simple-import-sort would file them under third-party imports.
// These patterns are derived from tsconfig.json — the single source of truth —
// so a newly declared alias is grouped correctly without touching this file.
const ALIAS_ROOTS = readImportAliasRoots().map((root) => root.slice(1)).join('|')
// simple-import-sort appends a NUL to type-only imports, so a bare alias root
// (`@config`, `@translations`) needs it accepted as an end-of-specifier marker.
const ALIAS_END = '(?:/|\\u0000|$)'
const ALIAS_IMPORT = `^@(?:${ALIAS_ROOTS})${ALIAS_END}`
const SCOPED_PACKAGE_IMPORT = `^@(?!(?:${ALIAS_ROOTS})${ALIAS_END})\\w`

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

      // --- every function is a const bound to an arrow function ---
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error',

      // --- max 2 parameters per function (core rule; TS-aware override below) ---
      'max-params': ['error', { max: 2 }],

      // --- ordered imports ---
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^\\u0000'],                        // side effects
          ['^node:'],                           // node builtins
          ['^\\w', SCOPED_PACKAGE_IMPORT],       // third-party packages
          [ALIAS_IMPORT],                       // project aliases
          ['^'],                                // anything else
          ['^\\.'],                             // relative
        ],
      }],
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
        // `<T,>` disambiguates a generic arrow from a JSX tag in .tsx — that
        // comma is syntax, not style, so it is not policed.
        generics: 'ignore',
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

      // --- `as const` object + derived type sharing one name (no-typescript-enum
      //     policy) is a deliberate declaration merge, not a redeclaration ---
      '@typescript-eslint/no-redeclare': 'off',

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
    // --- the http port is the only way to reach the network ---
    // Only its adapter may touch the transport library/global directly.
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['src/services/http/adapters/**'],
    rules: {
      'no-restricted-globals': ['error', {
        name: 'fetch',
        message: 'Import @services/http instead — only its adapter may use the transport directly.',
      }],
    },
  },

  {
    // --- a wrapped library is reachable only through its own port ---
    // Flat config merges rules by name, so every library lives in this single
    // `no-restricted-imports` entry; the blocks below re-declare the whole list
    // minus the one library that adapter is allowed to import.
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'expo-localization',
            message: 'Import @services/language instead — only its adapter may use this library.',
          },
          {
            name: 'i18n-js',
            message: 'Import @services/translate instead — only its adapter may use this library.',
          },
        ],
      }],
    },
  },

  {
    // --- the language adapter is the one place expo-localization is allowed ---
    files: ['src/services/language/adapters/**'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'i18n-js',
          message: 'Import @services/translate instead — only its adapter may use this library.',
        }],
      }],
    },
  },

  {
    // --- the translate adapter is the one place i18n-js is allowed ---
    files: ['src/services/translate/adapters/**'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'expo-localization',
          message: 'Import @services/language instead — only its adapter may use this library.',
        }],
      }],
    },
  },

  {
    files: ['eslint.config.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
])
