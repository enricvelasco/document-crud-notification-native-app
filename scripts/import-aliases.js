// Reads the import aliases declared in tsconfig.json `compilerOptions.paths`.
//
// tsconfig.json is the single source of truth for aliases: TypeScript and Metro
// read it natively, while jest.config.js and eslint.config.js derive their own
// configuration from this helper. Declaring a new alias there is therefore the
// only edit needed — see "Import aliases" in the README.
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const TSCONFIG_PATH = join(__dirname, '..', 'tsconfig.json')

// `{ "@core/*": ["./src/core/*"], ... }`
const readImportAliases = () => {
  const { compilerOptions } = JSON.parse(readFileSync(TSCONFIG_PATH, 'utf8'))
  return compilerOptions?.paths ?? {}
}

// The distinct alias roots, wildcard stripped: `['@assets', '@components', ...]`
const readImportAliasRoots = () => {
  const roots = Object.keys(readImportAliases()).map((alias) => alias.split('/')[0])
  return [...new Set(roots)].sort()
}

module.exports = { readImportAliases, readImportAliasRoots }
