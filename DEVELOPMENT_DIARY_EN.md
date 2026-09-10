# Development diary

Why this project is built the way it is. Each entry records a decision, the
alternative it beat and what it cost. Ordered oldest first.

> Spanish version: [DEVELOPMENT_DIARY_ES.md](./DEVELOPMENT_DIARY_ES.md)

---

## Enforce the code policy in the linter instead of in review
`2026-09-06` · `eslint.config.js`

> A convention nobody runs erodes one exception at a time.

- The rules this project cares about — no semicolons, every function an
  arrow-function `const`, a hard ceiling of two parameters — are exactly the
  kind that decay silently in review.
- All of them are ESLint rules instead, so `yarn lint` *is* the style guide and
  drift cannot accumulate.
- **Rejected** — adding Prettier: half of what needs policing here is
  architectural (`max-params`, `func-style`, restricted imports) and Prettier
  only formats, so it would mean two tools with an opinion about the same line.
- **Cost** — `eslint --fix` carries formatting a dedicated formatter would do
  faster, and legitimate code occasionally needs an explicit override.

---

## Hold ESLint at v9 while Expo's config catches up
`2026-09-06` · `package.json`

> Staying a major behind is cheaper than forking rules the framework curates.

- `eslint-config-expo@57` does not load under ESLint 10.
- Taking the new major would have meant dropping Expo's React Native rule set —
  the part that knows about Metro, JSX and RN globals — and rebuilding it.
- **Rejected** — hand-rolling a replacement config: it is maintenance the
  framework already does, and it would drift from upstream immediately.
- **Cost** — knowingly pinned to `^9` on a core tool until Expo supports 10.

---

## Resolve environment config at build time, then re-validate it at boot
`2026-09-06` · `app.config.ts` · `src/config/`

> `process.env` does not survive into a React Native bundle, so config has to be
> frozen into the manifest.

- Four environments (`local`, `test`, `staging`, `prod`) differ in API URL,
  timeout and dev tooling.
- `app.config.ts` reads `env/<APP_ENV>.env` while Expo builds the manifest and
  freezes the result into `extra.appConfig`.
- `src/config` reads it back through `expo-constants`, re-validates it, and
  exports one typed `appConfig` as the single entry point.
- **Rejected** — inline `process.env` references: they scatter environment
  knowledge across every file that needs a value.
- **Cost** — a duplicated `AppEnv` union; `app.config.ts` runs in Node before
  the alias resolver exists, so it cannot import from `src/`.

---

## Crash on missing configuration rather than fall back to a default
`2026-09-06` · `app.config.ts` · `src/config/env.ts`

> A silent default turns the most dangerous case into the invisible one.

- A missing `API_URL` that becomes an empty string resurfaces later as a
  confusing network failure, layers away from the env file that caused it.
- The build throws naming the exact key and file to fix; the runtime reader
  rejects an absent or malformed `extra.appConfig` with an actionable message.
- Values with a genuine safe default (`API_TIMEOUT_MS`, `SENTRY_DSN`) still get
  one — only the ones with no sane guess are fatal.
- **Rejected** — falling back to a development value: a production build
  pointing at a local API would then look exactly like a correct one.
- **Cost** — an incomplete env file stops the build outright.

---

## Give each non-production environment its own bundle identifier and scheme
`2026-09-06` · `app.config.ts`

> Four builds that can coexist on one device, each saying which one it is.

- Testing staging normally means uninstalling production, destroying its local
  state and making the two behaviours impossible to compare.
- Every non-production environment gets a suffixed bundle id, deep-link scheme
  and display name.
- **Rejected** — one identifier with a switched API URL: it hides the mistake
  worth catching, since a build on the wrong backend looks identical to a right
  one.
- **Cost** — four sets of native credentials to manage once this reaches store
  builds.

---

## Write the code policy as agent skills, not as a contributing guide
`2026-09-07` · `.claude/skills/`

> Policy belongs in the tool that writes the code, not in a file someone has to
> remember to open.

- Most of this project's code is written with an AI agent, and a
  `CONTRIBUTING.md` only helps at a moment that never coincides with typing.
- Eleven skills carry the conventions — naming, folder structure per layer,
  arrow functions, flat conditionals, no comments, dependency inversion — each
  with the rule, the reasoning and ❌/✅ examples.
- **Rejected** — leaving the rules only in the linter: a linter rejects a
  violation but cannot express *what to do instead*, which is the part that
  shapes a design.
- **Cost** — a second place where policy lives, to revise whenever a convention
  changes.

---

## Replace TypeScript enums with `as const` objects
`2026-09-07` · project-wide

> `enum` is one of the few TS constructs that is not erasable type syntax.

- It compiles to a runtime object the bundler cannot tree-shake, and produces a
  nominal type that rejects a string literal matching it exactly.
- Enumerations are a frozen object plus a derived type sharing one name and a
  `Types` suffix: ordinary JavaScript at runtime, a plain union at compile time.
- **Rejected** — keeping `enum` for the ergonomics: the bundle cost and the
  nominal-typing friction are paid on every use, the ergonomics only on writing.
- **Cost** — the object-and-type pair reads as a redeclaration, so
  `@typescript-eslint/no-redeclare` is off project-wide, losing its protection
  against genuinely accidental ones.

---

## Fix the view and screen layering before writing either
`2026-09-07` · `.claude/skills/view-structure` · `.claude/skills/screen-structure`

> Deciding where data loading stops is cheap now and expensive after a dozen
> screens.

- By default a screen fetches, catches, maps and paints, and by the time that
  is uncomfortable it is spread across many files.
- A `.ts` view calls the domain repositories and hands the screen a finished
  view model where each section is either data or a controlled error message.
- `Promise.allSettled` over `Promise.all` is the load-bearing choice: one failed
  call degrades one section instead of blanking the screen.
- **Rejected** — letting the first screen establish the pattern: whatever it
  needed would have become the convention by accident.
- **Cost** — designing before building risks solving problems that never arrive.
- **Open** — neither layer is implemented yet, so the shape is reasoned about
  but unproven.

---

## Put every third-party library behind a project-owned port
`2026-09-08` · `src/services/`

> Nothing above a library should need that library present to be tested.

- Libraries reached directly from screens and domains leak their types into ours
  and drag a native module into every test above them.
- Each capability — http, translation, language detection, document picking —
  is a folder under `src/services/` where one adapter file imports the library.
- Everything else depends on our own models, so a test mocks one module we own
  instead of the SDK.
- **Rejected** — taking the dependency as a function parameter: parameters are
  reserved for dynamic input, and threading a fixed dependency through every
  call site moves the coupling up a level rather than removing it.
- **Cost** — a port and a model set per library, which is why only the four the
  app genuinely needs exist.

---

## Make the port boundary a lint error, not a convention
`2026-09-08` · `eslint.config.js`

> A port nobody enforces decays on the first direct import.

- That import is invisible in review because it looks exactly like every other
  import in the file.
- `no-restricted-imports` names each wrapped library and the port to use
  instead; `no-restricted-globals` blocks bare `fetch`.
- Each adapter directory re-opens only the one library it owns, so the
  architecture fails the build instead of degrading quietly.
- **Rejected** — trusting the skills alone: they guide the agent writing new
  code but do nothing about code pasted in from elsewhere.
- **Cost** — ESLint's flat config merges rules by name, so each adapter block
  restates the full list minus its own library; a fifth wrapped library means
  editing five places.

---

## Translate API payloads into domain models at the edge
`2026-09-08` · `src/core/domains/document/`

> The backend's field naming should stop at the domain edge, not reach the UI.

- The documents API answers in the backend's shape — its naming and its nullable
  dates would otherwise travel into every component touching a document.
- A `<entity>PayloadToModel` mapper is the only place the payload is understood,
  so a field rename upstream is a one-file change.
- **Rejected** — mapping lazily at each call site: the same translation gets
  rewritten wherever it is needed, and each copy is free to disagree.
- **Cost** — a payload model, a domain model and a mapper per endpoint: three
  files to describe one response.

---

## Let repositories throw one domain error, not the transport's
`2026-09-08` · `src/core/domains/document/repositories/`

> A caller of `getDocumentList` should not have to know the list arrives over
> HTTP.

- If an `HttpError` escapes, every `catch` above it encodes the transport, and
  moving to a cached or local source later breaks all of them.
- Repositories catch whatever the port threw and rethrow a `DocumentError`
  carrying the original as `cause`, so the real reason stays available for logs.
- **Rejected** — returning a result object instead of throwing: it forces every
  call site to branch even where a failure is genuinely exceptional.
- **Cost** — a try/catch wrapper on every repository, and the discipline to keep
  it there.

---

## Split language detection from translation into two ports
`2026-09-08` · `src/services/language/` · `src/services/translate/`

> Which language the device is in, and how to render a key in it, are different
> jobs that change at different rates.

- They are backed by different libraries (`expo-localization`, `i18n-js`).
- Separate services mean a manual language picker touches the language port
  only, and swapping the translation engine touches the translation port only.
- **Rejected** — a single `i18n` service: it would make the device locale, a
  platform concern, reachable through a translation API.
- **Cost** — two ports and a wiring step between them where a merged service
  would have had none.

---

## Derive the import-alias list from `tsconfig.json`
`2026-09-08` · `scripts/import-aliases.js` · `eslint.config.js`

> `@core` is indistinguishable from a scoped npm package by shape alone.

- The import sorter filed project aliases under third-party imports, so every
  file opened with local modules pretending to be dependencies.
- The ESLint config builds its alias patterns by reading the `paths` map out of
  `tsconfig.json`, which stays the one place an alias is declared.
- **Rejected** — listing the aliases again in the lint config: the two lists
  would be equal only until the next alias, and the failure would be a silently
  mis-sorted import rather than an error.
- **Cost** — a build-time coupling between the lint config and `tsconfig.json`,
  and a script that has to stay outside the linted set.

---

## Build the UI in Storybook before the screens exist
`2026-09-09` · `.storybook/`

> Components built without a harness are only ever seen in the first screen that
> needed them.

- The component set is being built ahead of its screens, so the alternative is a
  throwaway screen per component or no visual check at all.
- Storybook shows every component's states side by side, so a button's disabled
  and pressed variants are exercised the day it is written.
- **Rejected** — deferring the UI until screens were ready: it collapses
  component design and screen composition into one step, and the component ends
  up shaped by its first caller.
- **Cost** — a second build pipeline (Storybook on Vite, the app on Metro) and a
  story to maintain per component.

---

## Organise `src/ui` by atomic design
`2026-09-09` · `src/ui/`

> The path should say what may depend on what.

- A flat components folder puts a button and a full card layout side by side as
  equals until the imports tangle.
- `atoms`, `molecules` and `organisms` make the dependency direction legible
  before opening a file.
- **Rejected** — grouping by feature in this layer: `src/ui` holds the reusable
  pieces, so filing them by the first feature that needed them would
  misrepresent them as belonging to it.
- **Cost** — a recurring judgement call about which layer something is;
  `InputDocument` as a molecule rather than an organism is exactly that.

---

## Give every component and screen the same folder shape
`2026-09-09` · `src/ui/`

> Finding a component's styles should not require opening it first.

- Every component is a PascalCase folder: `index.tsx` for the component,
  `styles.ts` for styles, an optional `resources/` with a `use<ComponentName>`
  hook, an optional `components/` for subcomponents that make no sense outside
  it.
- The nesting matches what renders — `DropdownButton` contains `DropdownMenu`,
  which contains `DropdownMenuOption`.
- Screens follow the identical shape, so moving between the two layers needs no
  new mental map.
- **Rejected** — letting each component pick its own layout: the cost of finding
  things is then paid on every visit instead of once.
- **Cost** — ceremony on the small ones; a component with two lines of styles
  still gets a folder.

---

## Wrap `react-native-svg` behind icon components
`2026-09-09` · `src/ui/atoms/icons/`

> The port rule applied to rendering rather than to a service.

- Inline icons mean SVG path data pasted into feature code, re-pasted at the
  next use, diverging in size and colour from the copy beside it.
- Each icon is a component under `src/ui/atoms/icons/` taking our own props, and
  the lint config makes that directory the only place `react-native-svg` may be
  imported.
- **Rejected** — an icon font: it adds an asset to load and gives up per-icon
  control of stroke and colour.
- **Cost** — a component per icon, written by hand.

---

## Wrap AsyncStorage behind a project-owned storage port
`2026-09-10` · `src/services/storage/`

> Persistence is a replaceable implementation, so the app asks to store a value
> under a key and never learns who answers.

- Nothing in the app persisted anything yet, so the first storage call was the
  moment to decide whether `@react-native-async-storage/async-storage` gets
  imported once or everywhere.
- `src/services/storage/` exposes `getItem` / `setItem` / `removeItem` /
  `clear` over our own `StorageServiceModel`, and `asyncStorageAdapter.ts` is
  the only file allowed to import the library — held by the same
  `no-restricted-imports` list that already guards the picker, localization,
  i18n and SVG.
- The port speaks values, not strings: the adapter owns the
  `JSON.stringify` / `JSON.parse`, so an unreadable stored value arrives as a
  `StorageError` at the boundary instead of a `SyntaxError` inside a screen.
- **Rejected** — a port that stores strings and leaves parsing to its callers:
  the same parse and its `try`/`catch` then get rewritten at every call site,
  each one free to disagree about what a corrupt value means.
- **Cost** — `getItem<TValue>` casts whatever comes back, so a shape change is
  caught where the value is used rather than where it is read.
- **Open** — async-storage was picked over `expo-sqlite/kv-store` (Expo's
  drop-in with the same API plus a synchronous read) because it is the library
  that was asked for by name; the trade-off between the two was never weighed.

---
