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

## Wrap `FlatList` behind a `List` that only knows how many columns
`2026-09-10` · `src/ui/molecules/List/`

> A list and a grid are the same collection seen twice, so they should not be
> two components.

- The document list is painted either as stacked `CardListItem` rows or as
  tiled `CardGridItem` cells, and the user flips between them at will.
- `List` takes `items`, `renderItem`, `keyExtractor`, and one layout knob:
  `columns`. One column is a list, two is a grid, and the switch is a number
  rather than a second component or a branch in the caller.
- It is the only file in the app that imports `FlatList`, so virtualisation is
  on by default everywhere instead of being something each caller remembers,
  and the React Native list API never reaches a template or a screen.
- `gap` applies between rows and between columns alike, and `empty` is painted
  in the space the rows would have taken — the two things every caller was
  otherwise going to re-derive.
- **Rejected** — a plain `View` wrapper that maps children with a gap: simpler
  to write, but it renders every document at once and pushes the two-column
  maths onto `flexWrap` at each call site.
- **Rejected** — calling `FlatList` directly from the template: one less file,
  but `columnWrapperStyle`, `contentContainerStyle` and the `numColumns`
  remount rule then get rewritten by whoever paints the next collection.
- **Cost** — `columns` is typed as a number, so `columns={7}` type-checks;
  the component clamps nothing and trusts the caller.

---

## Add templates as the fifth layer, and let them own their copy
`2026-09-10` · `src/ui/templates/`

> A screen should say which page it is, not how that page is assembled.

- `DocumentListScreen` was about to grow a header, a toolbar, a body and a
  footer — layout that belongs to the design system, not to the route.
- `src/ui/templates/` continues the atomic-design ladder the `ui` folder
  already climbs, and `DocumentListTemplate` owns the whole page, safe area
  included. The screen shrinks to wiring: state in, handlers out.
- Atoms and molecules keep taking plain strings — that is what makes them
  reusable. The template is rendered exactly once, so it reads its own labels
  through `useTranslate` instead of making the screen relay nine of them.
- Text that is not the page's own still arrives from outside: the error message
  is a prop, because whoever loaded the documents knows what went wrong and the
  template does not.
- **Rejected** — composing the page inside the screen: the layout is then
  unreachable from Storybook, and every state has to be produced by the app to
  be looked at.
- **Rejected** — a template that takes every label as a prop: it keeps the
  layer perfectly pure, but the screen becomes a relay of static strings and
  the copy for one page ends up split across two layers.
- **Cost** — the `ui` layer now depends on `@hooks/useTranslate`, so a template
  cannot be rendered without the translation catalogue behind it.

---

## One template with a discriminated state, not one template per state
`2026-09-10` · `src/ui/templates/DocumentListTemplate/`

> Loading, error and content differ in one block; the other three are identical
> in all of them.

- The page has three states, and the header, the toolbar and the add button are
  the same in every one. Three templates would duplicate that chrome three
  times and charge for a header change three times.
- The states arrive as one discriminated `DocumentListStateModel`
  (`loading` | `error` | `content`), and `DocumentListBody` swaps only the block
  between the toolbar and the footer, with a guard clause per state and no
  nesting.
- An empty list is `content` with no documents, not a fourth state — the list
  itself paints the empty message, so the template never has to ask how many
  documents there are.
- Sort and layout are deliberately asymmetric. Sort reorders the documents,
  which the template does not own, so it is controlled from outside. Layout
  changes nothing beyond this page, so the template keeps it in its own hook and
  `initialLayout` only says where it starts.
- **Rejected** — three templates, one per state: each reads flatter on its own,
  but the screen goes back to deciding which one to mount and the shared chrome
  needs a fourth component anyway.
- **Rejected** — a template with a `children` slot: maximum flexibility, and it
  gives up the one guarantee a template is for — that every state of this page
  looks the way it was designed to.
- **Cost** — adding a state means touching the union, the body and the stories
  together; the compiler forces it, but it is three files rather than one.

---

## Name translation keys so they cannot be read as a plain string
`2026-09-10` · `src/translations/`

> At the call site, `translate('documentListAdd')` and a hardcoded label look
> exactly alike.

- The catalogue used camelCase keys, which read like any other identifier — the
  one thing a key must never be mistaken for is the literal it replaces.
- Keys are now `_SCREAMING_SNAKE` with a leading underscore, scoped by whoever
  owns the copy: `_DOCUMENT_LIST_TEMPLATE_TITLE`, `_DOCUMENT_LIST_TEMPLATE_ADD`.
  Copy shared across the app stays unscoped — `_LOADING`, `_CANCEL`, `_RETRY`.
- The prefix carries an ownership claim: deleting `DocumentListTemplate` names
  the keys that die with it, without grepping for the strings themselves.
- **Rejected** — a generated constants map (`TranslationKeys.documentListAdd`):
  it buys autocomplete, but `TranslationsModel = typeof en` already types every
  key against the English catalogue, so it would be a second file to keep in
  step for no extra safety.
- **Cost** — the keys are long and the catalogues read noisier; renaming a
  component means renaming its keys in three files at once.

---

## Every colour comes from the theme, and every surface names its own
`2026-09-10` · `src/constants/theme.ts` · `src/ui/`

> A hex code in a component is a colour no other component can find.

- `Colors` in `src/constants/theme.ts` is the only source of colour in the app.
  No component writes `#FFFFFF`, `'white'` or an `rgba()`: it reaches for the
  role it means — `background.default`, `text.light`, `border.dark`.
- The roles carry the meaning, so a repaint is one edit in one file rather than
  a grep for hex codes that have drifted apart in a dozen components.
- Surfaces are painted explicitly rather than inherited. `DocumentListTemplate`
  gives its header, its body and its footer a background each, even where two
  agree today, because a page that relies on its parent's colour breaks
  silently the moment it is mounted somewhere else — and in a template that
  parent is the safe area, whose insets would otherwise show the wrong colour
  above the header.
- **Rejected** — a hex code inline "just for this one": that is exactly how the
  second and third copies get written, and none of them move when the palette
  does.
- **Cost** — the palette is a flat set of roles with three variants each, so a
  colour that fits no existing role has to earn a new one instead of being
  written where it is needed.

---

## Put views under `src/core/views/`, not beside the screens
`2026-09-11` · `src/core/views/` · `.claude/skills/view-structure`

> A view orchestrates domains and never renders anything, so it belongs where
> the domains are.

- A layer is placed by what it does, not by what consumes it. A view
  orchestrates domains and paints nothing, so it is data work — and `src/views/`
  gave it a presentation address, sibling to `src/screens/` and `src/ui/`, for
  a folder that is forbidden to contain JSX.
- Views now sit at `src/core/views/<Entity><Purpose>View/`, next to
  `src/core/domains/`, reachable through the `@core/*` alias that already
  exists in `tsconfig.json`, Metro and Jest.
- The four skills that named the old path were rewritten in the same change, so
  the written policy and the tree cannot drift apart.
- **Rejected** — keeping `src/views/` and registering a new `@views/*` alias:
  it splits the two halves of the data layer across the tree and adds an alias
  to three configs to say less than `core` already says.
- **Cost** — `core` no longer reads as "the domains": it now holds two kinds of
  thing, and where the boundary falls has to be learned rather than guessed.

---

## Thread the abort signal from the screen down to `fetch`
`2026-09-11` · `src/services/http/` · `src/core/` · `src/screens/DocumentListScreen/`

> A cancellation that stops at the view cancels nothing — only the transport can
> abandon a request in flight.

- The screen owns the `AbortController` because it owns the mount lifetime, but
  the signal only does work at the `fetch` call four layers below it.
- `HttpServiceModel.get` grew an `options` argument carrying the signal;
  `getDocumentList(signal)` and `loadDocumentListView(signal)` are pure
  conduits that forward it and use it for nothing themselves.
- The adapter keeps its own controller for the timeout and links the caller's
  signal into it, so whichever fires first aborts the request and neither
  mechanism has to know about the other.
- **Rejected** — guarding `setState` in the screen and letting the request run
  to completion: it silences the warning while the connection, the parse and
  the mapping all still happen for a screen nobody is looking at.
- **Cost** — every repository that wants to be cancellable has to accept and
  forward a signal it never reads itself.

---

## Give an aborted request its own error type so leaving a screen is not a failure
`2026-09-11` · `src/services/http/models/` · `src/core/views/DocumentListView/`

> Navigating away is not an error, and it should certainly not be reported as a
> timeout.

- The adapter mapped every `AbortError` to `HttpErrorTypes.Timeout`, so closing
  the list logged "Request to /documents timed out" — a diagnosis that is
  simply false, and the kind that sends someone hunting a network problem that
  does not exist.
- `HttpErrorTypes.Aborted` separates the caller's cancellation from the
  adapter's own timeout; which one fired is decided by asking whether the
  caller's signal is the aborted one.
- The view raises this as a third section status, `Aborted`, beside `Ok` and
  `Error`, so the screen returns early instead of logging and painting an error
  over a screen that is going away.
- **Rejected** — letting the abort fall through as an ordinary rejection:
  cheaper, but it fills the console with failures during normal navigation,
  which is how real failures stop being read.
- **Cost** — a third branch in every consumer of a view section, on top of the
  two the pattern already had.

---
