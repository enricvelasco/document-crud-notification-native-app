// Jest resolves imports through the same aliases as TypeScript and Metro.
// `compilerOptions.paths` in tsconfig.json is the single source of truth: add an
// alias there and it shows up here automatically — see "Import aliases" in the
// README. Metro reads tsconfig.json itself, so it needs no mapping of its own.
const { readImportAliases } = require('./scripts/import-aliases')

const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// `@core/*` becomes `^@core/(.*)$`; an alias without a wildcard matches exactly.
const toModulePattern = (alias) => {
  const starIndex = alias.indexOf('*')
  if (starIndex === -1) {
    return `^${escapeForRegExp(alias)}$`
  }
  const prefix = escapeForRegExp(alias.slice(0, starIndex))
  const suffix = escapeForRegExp(alias.slice(starIndex + 1))
  return `^${prefix}(.*)${suffix}$`
}

// `./src/core/*` becomes `<rootDir>/src/core/$1`.
const toModuleTarget = (target) => {
  const relativeTarget = target.replace(/^\.\//, '').replace('*', '$1')
  return `<rootDir>/${relativeTarget}`
}

// Jest keeps the first pattern that matches, so exact aliases are tried before
// wildcards and longer prefixes before shorter ones — the same precedence
// TypeScript and Metro apply.
const byMatchPriority = (alias, otherAlias) => {
  const hasWildcard = alias.includes('*')
  const otherHasWildcard = otherAlias.includes('*')
  if (hasWildcard !== otherHasWildcard) {
    return hasWildcard ? 1 : -1
  }
  return otherAlias.length - alias.length
}

const toModuleNameMapper = (aliases) => {
  const entries = Object.keys(aliases)
    .sort(byMatchPriority)
    .map((alias) => [toModulePattern(alias), aliases[alias].map(toModuleTarget)])
  return Object.fromEntries(entries)
}

module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: toModuleNameMapper(readImportAliases()),
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
}
