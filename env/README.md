# Environments

`APP_ENV` selects the target: `local` (default), `test`, `staging`, `prod`.
Only `local` points at a real service; the rest hold placeholder values.

`app.config.ts` reads `env/<APP_ENV>.env` (then optional `env/<APP_ENV>.env.local`),
builds `extra.appConfig`, and gives non-prod builds a distinct name, scheme and
native id. `src/config/env.ts` reads it back, validates it, and exposes a typed
`appConfig` plus `isLocal` / `isTest` / `isStaging` / `isProd`.

```ts
import { appConfig, isProd } from '@/config'
```

```bash
yarn start            # local
yarn start:staging    # APP_ENV=staging
yarn env:print        # resolved public config
```

Windows needs `cross-env` in front of the `APP_ENV=` scripts.

New variable: add it to every `env/<name>.env`, to `buildRuntimeConfig` in
`app.config.ts`, and to `AppConfig` in `src/config/env.ts`.

New environment: add the name to `APP_ENVS` in `src/config/app-env.ts` (and the
copy in `app.config.ts`) and drop in `env/<name>.env`.

`env/<name>.env.local` is gitignored — put machine-specific overrides and secrets there.
