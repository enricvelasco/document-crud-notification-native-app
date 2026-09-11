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

## Give the pull-to-refresh gesture to `List` instead of to a wrapper
`2026-09-11` · `src/ui/molecules/list/`

> The gesture belongs to whatever scrolls, and only one component in this app is
> allowed to scroll.

- `List` is the single place that talks to `FlatList`, so it is also the only
  place that can hand a `RefreshControl` to the `refreshControl` prop the
  gesture actually needs.
- That prop takes an element, not a component: on Android `ScrollView` clones it
  and makes it the parent of the scroll view itself, so it has to be the real
  `RefreshControl` and not a wrapper of ours.
- `onRefresh` is what turns the gesture on — without it the prop stays
  `undefined`, so a list nobody can refresh never grows the Android
  swipe-refresh wrapper either.
- `isRefreshing` stays with the caller, because only the caller knows when its
  reload finished — `List` never lowers the spinner by itself.
- **Rejected** — a `pullToRefreshBox` wrapping the list: a wrapper can only
  bring its own `ScrollView`, and nesting a virtualised list inside one trades
  virtualisation away for a gesture `FlatList` already exposes.
- **Cost** — two more props on a molecule that had five, and the gesture reaches
  only what `List` paints: the error state is a plain `View` and cannot be
  pulled.

---

## Keep refreshing beside the list state rather than inside it
`2026-09-11` · `src/screens/documentListScreen/` · `src/ui/templates/documentListTemplate/`

> A refresh that paints the loading state hides the very rows the gesture is
> pulling on.

- `DocumentListStateModel` already had `Loading`, and reusing it for a refresh
  would swap the body for a spinner — the documents vanish the moment you pull
  them.
- `isRefreshing` travels beside `state` from the screen to the template, so the
  content block stays painted and `RefreshControl` draws over it.
- The refreshed result still goes through the same `toDocumentListState`, so a
  reload that fails replaces the rows with the controlled error message exactly
  as the first load would.
- **Rejected** — a fourth `DocumentListStateTypes.Refreshing` carrying the
  current documents: it duplicates the content case for the sole purpose of
  tagging it, and every consumer grows a branch that paints the same thing.
- **Cost** — two ways to say "loading" on one screen, and the reader has to know
  which of them blanks the body.

---

## Refresh through the abort controller the screen already owns
`2026-09-11` · `src/screens/documentListScreen/resources/`

> A reload started by a gesture deserves the same cancellation as the one
> started by mounting.

- The mount effect already owned an `AbortController` aborted on unmount, but a
  refresh fired just before navigating away had nothing cancelling it.
- The effect now keeps that controller in a ref, and `handleRefresh` passes its
  signal down the same path `loadDocumentListState` already threads to `fetch`.
- `refreshDocumentListState` raises the flag, awaits the load and lowers it
  again — including on an abort, where `toDocumentListState` returns `null` and
  no state is written.
- **Rejected** — a fresh controller per refresh: it would let a second pull
  cancel the first, but it needs its own bookkeeping to stay tied to unmount,
  which is the cancellation that actually matters here.
- **Cost** — two pulls in quick succession both run to completion, and the later
  answer wins by arriving last rather than by design.

---

## Build the `RefreshControl` inline rather than behind a `to*` resource
`2026-09-11` · `src/ui/molecules/list/`

> A `to*` name promises a mapper, and the thing it was naming returned JSX.

- The refresh control started as `toListRefreshControl` in `resources/`, beside
  `toListColumnStyle` and `toListContentStyle` — which return styles, not
  elements.
- Everything prefixed `to*` in this repo is a mapper, so the name told a reader
  to expect data and handed them a component instead.
- Promoting it to a `ListRefreshControl` component was the obvious fix and the
  wrong one: `refreshControl` takes an element that Android clones as the scroll
  view's parent, so the wrapper would have to forward the `style` and `children`
  React Native injects, and the call site would need a cast.
- It is now a ternary inside `List` choosing between an element and `undefined`,
  which is a choice between two values rather than a branch worth a file.
- **Rejected** — keeping the extraction under a `get*` name: it satisfies the
  convention while leaving a one-caller file whose only job is to hold JSX that
  reads perfectly well where it is used.
- **Cost** — `List` now carries an eight-line prop in its JSX, and the next
  control it grows will push toward the same question again.

---

## Own the reconnection inside the WebSocket port, not in the screens
`2026-09-11` · `src/services/webSocket/`

> A socket that drops is ordinary traffic, not an error every consumer has to
> learn to retry.

- The http port answers one request and is done; a socket outlives the screen
  that opened it and gets closed by any sleep, tunnel or network switch.
- `createNativeWebSocketAdapter` reopens on an unexpected close with a delay
  that doubles up to `maxReconnectDelayMs`, resets the attempt count once a
  connection opens, and gives up for good when the caller calls `close()`.
- Consumers see the retry only as an `onStatusChange` of `Reconnecting`, so a
  screen paints a banner instead of owning a timer.
- **Rejected** — exposing raw connect/disconnect and letting each caller retry:
  every consumer would reimplement the same backoff, and two screens would
  disagree on how many attempts is too many.
- **Cost** — a connection retries whether or not its caller wants it, and the
  attempt budget is fixed for the whole app rather than per connection.

---

## Hand back a connection handle and push messages through callbacks
`2026-09-11` · `src/services/webSocket/models/`

> A stream that never ends has no promise to resolve.

- `httpService.get` returns `Promise<TResponse>` because a request has exactly
  one answer; a subscription has none, or thousands.
- `connect` returns a `WebSocketConnectionModel` — `send` and `close` —
  synchronously, and messages, status and errors arrive on `onMessage`,
  `onStatusChange` and `onError`.
- The handle exists before the socket opens, so the caller can always close it:
  during the handshake, or while a reconnection is still pending.
- **Rejected** — resolving a promise on open: it leaves the caller nothing to
  cancel during the handshake, and it cannot report a later reconnection because
  the promise has already settled.
- **Cost** — a `send` before the socket is open throws instead of queueing, so
  the caller has to watch the status.

---

## Put the socket URL in the env files and the reconnection knobs in code
`2026-09-11` · `env/` · `src/services/webSocket/constants.ts`

> An address changes per environment; a backoff curve is a decision about the
> app.

- `WEB_SOCKET_URL` joins `API_URL` in every `env/<name>.env` and is validated at
  boot by `readAppConfig` the same way, so a build missing it crashes instead of
  quietly pointing somewhere else.
- The connection timeout, the base delay, the delay ceiling and the attempt
  budget live in `src/services/webSocket/constants.ts`, where the port assembles
  its own config.
- **Rejected** — four more variables in every environment file: none of them
  would ever differ between local and prod, and each would need its own
  validation and its own default.
- **Cost** — retuning the backoff is a code change and a release, not an env
  edit.

---

## Combine the global providers into one component instead of nesting them by hand
`2026-09-11` · `src/context/`

> Adding a global context should cost one array entry, not another level of
> indentation in the root layout.

- `_layout.tsx` is the only place a context can be mounted app-wide, and every
  provider added there pushes the navigation tree one level deeper and
  re-indents everything below it.
- `combineComponents` folds a list of providers into a single component — first
  entry outermost, children reaching the innermost untouched — and
  `AppContextProvider` is that fold applied to `APP_CONTEXT_PROVIDERS`.
- The fold runs once at module level, so the component identity is stable;
  combining during render would rebuild the component type on every pass and
  remount the whole tree under it.
- **Rejected** — nesting one provider per concern by hand in the layout: it
  reads fine at two and becomes an unreviewable pyramid at six, where adding a
  context re-indents every line below it.
- **Cost** — the nesting order is now an array position instead of something
  visible in the JSX, so a provider that depends on another has to be placed
  correctly with nothing in the code to enforce it.

---

## Give the notification domain a read-only subscription, not the raw socket
`2026-09-11` · `src/core/domains/notification/`

> A caller that can `send` on the notification stream is a caller that can
> invent a protocol nobody wrote down.

- `/notifications` is a one-way feed: the server pushes, the app listens.
  `subscribeToNotifications` therefore returns a `NotificationSubscriptionModel`
  carrying only `close`, even though `webSocketService.connect` hands back both
  `send` and `close`.
- The caller passes `onNotification` and receives a `NotificationModel` already
  mapped out of the server's PascalCase payload, so nothing above the domain
  ever sees `UserID` or `DocumentTitle`.
- A `WebSocketError` reaching `onError` is rewrapped as a `NotificationError`
  with the original as `cause`, and a `connect` that throws outright surfaces
  the same way — the view layer attributes the failure to notifications, not to
  "a socket somewhere".
- **Rejected** — returning the `WebSocketConnectionModel` straight through: it
  is one line shorter and it puts the transport's whole surface, `send`
  included, in every consumer's hands.
- **Cost** — the day a notification needs an outbound message (an ack, a
  filter), the subscription model has to grow a method instead of the caller
  just using what the port already offers.

---

## Open the notification stream from a context provider, not from the root layout
`2026-09-11` · `src/context/notificationContext/`

> The socket has to live as long as the app does, and `_layout.tsx` is a
> navigator, not a lifecycle.

- `NotificationContextProvider` is an entry in `APP_CONTEXT_PROVIDERS`, so it
  mounts with the app, subscribes once on mount and closes the stream on
  unmount — the same slot every other global will use.
- The work sits in `resources/services.ts` (`startNotificationLogging`, and the
  two loggers it wires) and `useNotificationSubscription` is a bare `useEffect`
  around it, so the behaviour is testable without a renderer — this project has
  no `@testing-library/react-native`.
- `context.test.ts` mocks the provider away: it is about the fold, and the real
  provider would drag `appConfig` and a live socket into a test of composition.
- **Rejected** — a `useEffect` in `_layout.tsx`: it works, and it puts app-wide
  lifecycle in the file that is supposed to describe routes, where the next
  global concern would land next to it.
- **Cost** — the provider currently shares nothing, so it is a context in
  placement only; until it holds state, a reader has to open it to find out it
  exists for its side effect.

---

## Let screens reach notifications through a hook, never through the context
`2026-09-11` · `src/hooks/useNotifications.ts` · `src/context/notificationContext/`

> A screen should ask for "the notification count", not for "the thing the
> notification context happens to hold".

- `NotificationContext` now carries `{ count, startSubscription,
  stopSubscription }`, and the provider still opens the stream on mount — the
  app is subscribed from the root without any screen asking.
- `useNotifications` in `src/hooks/` is the only consumer of `useContext`, so a
  screen imports `@hooks/useNotifications` and never learns a context exists.
  It throws when called outside the provider tree instead of handing back a
  `null` every call site would have to narrow.
- The start/stop lifecycle lives in `createNotificationStreamController`, a
  plain closure in `resources/services.ts` holding one subscription: `start` is
  a no-op while a stream is open, `stop` closes and clears it, and starting
  again opens a fresh one. That makes the semantics testable with no renderer,
  and it makes the effect's double-invoke under StrictMode a non-event.
- This supersedes the cost noted in the previous entry — the provider now holds
  state, so it is a context in substance and not only in placement.
- **Rejected** — exporting `NotificationContext` for screens to consume
  directly: one import less, and every screen would then be coupled to how the
  value is provided, so moving notifications to a store later would touch every
  one of them.
- **Cost** — there is a single shared stream, so a screen calling
  `stopSubscription` stops it for the whole app, not just for itself. Nothing in
  the API says so.

---

## Give up on the notification stream after three failures and say so
`2026-09-11` · `src/context/notificationContext/` · `src/hooks/useNotifications.ts`

> A stream that keeps failing quietly is worse than one that stops and admits it.

- The websocket adapter already retries with backoff, but nothing above it ever
  decided a stream was beyond saving: against a dead backend it reconnected on
  a loop while the UI showed a stale count and no way to know.
- `createNotificationStreamController` now counts consecutive failures, closes
  the subscription on the third and calls `onFailureLimitReached`. A delivered
  notification resets the count, so an isolated blip never trips it, and once
  the limit is hit further errors are ignored instead of re-reporting.
- `useNotificationSubscription` turns that into `isError`, which
  `useNotifications` hands to screens, so the UI can offer a retry —
  `startSubscription` clears the flag and opens a fresh stream.
- **Rejected** — putting the limit in `nativeWebSocketAdapter`: it counts
  *reconnects*, which is a transport concern, while "this feature is broken,
  tell the user" is the subscription's call and needs a React-visible signal
  the adapter has no business owning.
- **Cost** — every failure weighs the same, so three malformed messages close a
  healthy socket, and the adapter's `maxReconnectAttempts: 5` is unreachable in
  practice because three failed reconnects stop the stream first. The two
  limits only make sense read together.

---

## Bind everything with const and give mutable state a name
`2026-09-11` · `.claude/skills/const-bindings/` · `src/context/notificationContext/resources/services.ts`

> `let` is not slower — it is just a promise the reader never gets.

- The notification controller held its subscription and its failure count in two
  `let`s at the top of a closure, which is how every factory in this codebase
  had held state until now.
- `src/` now declares bindings with `const` only. State that has to change lives
  in a `const`-bound object typed by a `<Thing>StateModel` interface, so a
  closure's memory is one typed declaration instead of loose bindings collected
  down the file.
- The reason is reading cost, not speed. `let` and `const` compile to the same
  scope slot and hoist identically into the same temporal dead zone, so nothing
  here runs faster. What changes is that a name means one thing for its whole
  scope, and that mutation has to be spelled `state.x` where it happens.
- **Rejected** — leaning on `prefer-const`: it only flags a `let` that is never
  reassigned, which is the case nobody gets wrong, so it would leave untouched
  every binding the policy is actually about.
- **Cost** — the rule is not in `eslint.config.js` yet, because switching it on
  fails the websocket and language adapters that predate it. Until those are
  reshaped this policy rides on review, which is the thing this project decided
  in its first entry not to rely on.

---

## Report a broken notification feed on the badge itself, not beside it
`2026-09-11` · `src/ui/atoms/badge/` · `src/screens/documentListScreen/`

> The bell already knew the stream had died; it just kept showing the last count it had, which reads as current.

- `useNotifications` has exposed `isError` since the stream started giving up
  after three failures, but nothing painted it. A count nobody can vouch for is
  worse than no count, because a stale number carries no sign that it is stale.
- `Badge` takes `isError`: red fill, `!` in place of the number, and visible at
  zero — the one case a zero count renders anything. The count is ignored rather
  than cleared, so the pill returns to the number the moment the error lifts.
- The screen hook reads `count` and `isError` from the context hook and hands
  them down as `notificationCount` and `hasNotificationError`. The template still
  takes plain props and never touches the context, so it stays paintable from
  Storybook. `disabled` wins over `isError` — an inert control should not shout
  in red while the icon beside it greys out.
- **Rejected** — a banner or a toast over the list: the failure belongs to the
  bell, not to the documents, and a dismissible message is gone by the time the
  user wonders whether the count is real. The badge is exactly where the wrong
  number would otherwise be.
- **Cost** — `!` explains nothing on its own, and the red fill says nothing at
  all to a screen reader, so the accessible label has to swap to
  `_DOCUMENT_LIST_TEMPLATE_NOTIFICATIONS_ERROR` to carry the state. A fourth
  palette role (`Colors.error`) now exists for a single pill.
- **Open** — `startSubscription` is wired and still uncalled: there is no retry
  from the UI, so the badge reports the failure without offering a way out of it.

---

## Let the new-document form own its fields and `onSubmit` own the outcome
`2026-09-11` · `src/ui/templates/newDocumentFormTemplate/`

> The template can hold a half-typed name, but it has no business deciding what
> a failed creation says to the user.

- The form has three fields, a submit button and a failure path. Lifting the
  field values to the screen means a re-render of the whole sheet per keystroke
  over state nobody above the template can use; leaving the failure inside it
  means the template inventing wording for a call it did not make.
- The split follows who can answer the question. Values, `isSubmitting` and
  whether the button is pressable stay in `useNewDocumentFormTemplate`;
  `onSubmit` takes the values and answers with a `NewDocumentFormResponseModel`
  — success, or an error carrying its own `message` — and the template only
  paints it.
- An error leaves the fields exactly as typed so a retry costs nothing, and
  locks them rather than swapping the form for a spinner, so what is being
  created stays readable while it is in flight.
- **Rejected** — `onSubmit: () => void` with a separate `errorMessage` prop, the
  shape `DocumentListTemplate` uses for its state. It works there because the
  screen owns the documents; here it would force the screen to hold a piece of
  state whose only reader is the template, and to keep it in step with a
  submission the template already tracks.
- **Cost** — two ways to fail now exist side by side: a rejected promise still
  escapes the template untouched, so every caller must resolve its own errors
  into the response model rather than throwing them.
- **Open** — what success does beyond clearing the fields was never settled. The
  template does not close the sheet, so whoever wires `onSubmit` decides whether
  a created document also dismisses it.

---

## Share the sheet-over-route dismissal between both sheet screens
`2026-09-11` · `src/hooks/useBottomSheetScreen.ts`

> A sheet that is really a route has to close twice — visually, then by
> navigating back — and that two-step was about to be copy-pasted.

- `/detail` and now `/new` are both `transparentModal` routes painted as a
  bottom sheet, so closing one means hiding the sheet, letting the exit
  animation finish, and only then calling `goBack` — otherwise the route
  unmounts mid-animation and the sheet vanishes instead of sliding away.
- `useBottomSheetScreen(sheetScreenRatio)` now owns that sequence — the
  `isVisible` flag, the `InteractionManager.runAfterInteractions(goBack)`
  deferral and its cancellation — and each screen keeps only its own height
  ratio: `0.5` for detail, `0.75` for the form, which has to fit a header, three
  fields and a button pinned below them.
- **Rejected** — copying `useDocumentDetailScreen`'s body into
  `useDocumentNewScreen`. The deferral is the kind of detail that gets fixed in
  one copy and not the other, and a sheet that disappears instead of closing is
  easy to miss in review.
- **Cost** — `src/hooks/` now holds a hook only two screens can use, and the
  height ratio became a parameter, so a sheet's proportion is decided at the
  call site while its lifecycle is decided in the hook.
- **Open** — presenting the form as a route rather than as a flag on
  `DocumentListScreen` was specified rather than weighed here, so the trade-off
  against inline state was never argued.

> **Superseded** on `2026-09-11` by [Present the sheet screens as native formSheet routes](#present-the-sheet-screens-as-native-formsheet-routes) — a native `formSheet` route pops itself, so there is no two-step dismissal left to share.

---

## Resolve the unwired submit as a success instead of faking a failure
`2026-09-11` · `src/screens/documentNewScreen/resources/services.ts`

> There is no create endpoint yet, and the form's contract has no way to say
> "nothing happened".

- `NewDocumentFormSubmitType` must answer with either success or an error
  carrying a message, so a submit with nothing behind it still has to pick one —
  and the template acts on whichever it gets.
- `submitNewDocumentWithoutPersistence` resolves success and does nothing else.
  Its name is the whole disclosure: the day a create repository exists, that one
  binding is what gets replaced, and neither the screen nor the template moves.
- **Rejected** — answering with an error such as "not implemented". It paints a
  red message the user can neither fix nor retry past, and it exercises the
  failure path in the one place where nothing actually failed.
- **Cost** — the template clears its fields on success, so the sheet now reports
  a document created that was never stored. Anyone demoing this sees a create
  flow that works.
- **Open** — whether a real success should also dismiss the sheet is still
  unanswered, carried over from the template's own entry; the stub leaves it
  open.

---

## Hand the sheet's full width to content that brings its own padding
`2026-09-11` · `src/ui/organisms/bottomSheetNavigationWrapper/`

> A template that already pads itself and draws edge-to-edge rules cannot live
> inside the sheet's own 16pt gutter.

- `@expo/ui`'s `BottomSheet` pads its children by default on every platform —
  16pt sideways — and the wrapper never passed `contentPadding`, so it inherited
  that. Harmless for the detail sheet's centred text; wrong for
  `NewDocumentFormTemplate`, which owns its `Spacing.three` padding and ends in a
  footer whose top border is supposed to span the sheet.
- `hasContentInset` (default `true`) now decides it, and the inner content `View`
  stretches to `width: '100%'` rather than relying on the host to size it.
  `DocumentNewScreen` is the one caller that turns the inset off.
- **Rejected** — dropping the inset for everyone. It is the right default for
  content that brings no padding of its own, which is exactly what the wrapper's
  stories demonstrate, and removing it would silently re-space that content.
- **Cost** — a fourth boolean on a wrapper that already carries three, and a
  layout rule the caller has to know about: turn the inset off and the padding
  becomes your problem.

> **Superseded** on `2026-09-11` by [Present the sheet screens as native formSheet routes](#present-the-sheet-screens-as-native-formsheet-routes) — the route's content fills the sheet, so there is no wrapper inset to opt out of.

---

## Name the sheet's two colours apart instead of calling the scrim a background
`2026-09-11` · `src/ui/organisms/bottomSheetNavigationWrapper/styles.ts`

> One prop called `backgroundColor` was painting the thing behind the sheet, not
> the sheet.

- `BOTTOM_SHEET_NAVIGATION_WRAPPER_BACKGROUND_COLOR` was a translucent black fed
  to `scrimColor`, so the sheet's own chrome — the drag-indicator zone and, on
  iOS, the home-indicator inset — kept the platform default and read as a grey
  rim around a form that paints itself `Colors.background.default`.
- The two are now separate: `backgroundColor` is the sheet's surface, wired to
  `containerColor` and defaulting to the theme's white, and `scrimColor` is the
  veil behind it, keeping the translucent black.
- **Rejected** — turning the existing constant white where it was, still wired to
  the scrim. It would have whited out the list behind the sheet on Android
  instead of dimming it, and left the grey rim exactly as it was.
- **Cost** — a fifth prop, and the platform matrix got wider rather than
  narrower: the surface lands on Android, iOS 16.4+ and web, the veil on Android
  alone.
- **Open** — the veil is still a literal `#00000066`. The palette has no
  translucent role to source it from, so it stays a hex until one exists.

> **Superseded** on `2026-09-11` by [Present the sheet screens as native formSheet routes](#present-the-sheet-screens-as-native-formsheet-routes) — the platform paints both the surface and the scrim; only the surface stays ours, via `contentStyle`.

---

## Present the sheet screens as native formSheet routes
`2026-09-11` · `src/app/_layout.tsx`

> The sheet was being built twice: once by the navigator presenting the route,
> and again by a component presenting a sheet inside it.

- `/detail` and `/new` were `transparentModal` routes, each rendering a
  `BottomSheetNavigationWrapper` around `@expo/ui`'s `BottomSheet`. A modal
  inside a modal, so closing took two steps in a fixed order — hide the sheet,
  wait out its animation, then pop the route — and every sheet concern (scrim,
  inset, surface colour, which gestures dismiss) had to be re-exposed as a prop.
- expo-router reaches the same native sheet from the route declaration:
  `presentation: 'formSheet'` with `sheetAllowedDetents` keeping the heights the
  ratios had (`0.5` for detail, `0.75` for the form). The screens now render
  their content and nothing else, and dismissal is the platform's.
- That deleted the wrapper and its ten files, the `useBottomSheetScreen`
  deferral, `useDocumentDetailScreen` in full, and with them the inset and
  colour props the two entries above had just introduced.
- **Rejected** — keeping the wrapper for the escape hatches its stories
  documented: per-platform dismissal modifiers and an Android scrim colour.
  Neither route ever passed them, so they were knobs with no hand on them.
- **Cost** — the control that is left is what the navigator exposes.
  `sheetGrabberVisible` is iOS-only, the detent list is the whole sizing API, and
  the separate swipe/backdrop dismissal switches are gone. `@expo/ui` is now an
  unused dependency.
- **Open** — this was not run on a device. Whether `0.75` leaves the form's
  fields clear of the keyboard is exactly what the try-out has to answer; a
  second detent (`[0.75, 1]`) is the lever if it does not.

---

## Add an action layer as the write-side counterpart of a view
`2026-09-11` · `src/core/actions/createDocumentAction/`

> A view answers "what does this screen paint on load". Nothing answered "what
> happens when this screen submits".

- Creating a document is three steps in a row — read the picked file, encode it,
  post it — and each can fail with a different message. Putting that in the
  screen's hook would make the screen orchestrate domains; putting it in the
  domain would make a repository read the filesystem.
- `src/core/actions/` mirrors `src/core/views/` exactly: one folder per
  operation, an entry point, a mapper folder named for the direction it travels,
  models, mocks and a test. The difference is the direction — a view fans out
  with `Promise.allSettled` and returns per-section state, an action is a single
  sequence and returns one `ActionResultType` (`ok`, or `error` with a
  translated message and the raw cause).
- The screen keeps its shape: `documentNewScreen` still hands the template a
  `NewDocumentFormSubmitType`, and does two things with the action's result —
  translates it into the template's response model, and closes the sheet when it
  says the document was created. Both live in `resources/`, so the hook stays
  wiring and the behaviour stays testable without a renderer.
- **Rejected** — reusing `ViewSectionType` for the outcome: its `aborted` branch
  is meaningless for a submit, and an `ok` case that carries no data would have
  needed a `void` type parameter at every call site.
- **Cost** — a second status union (`ActionStatusTypes`) living alongside
  `ViewSectionStatusTypes`, and a second folder convention to learn.

---

## Simulate the create endpoint inside the repository, not above it
`2026-09-11` · `src/core/domains/document/repositories/createDocument.ts`

> The endpoint does not exist yet. Everything that depends on its *shape* can
> still be built and tested today.

- `createDocument` maps the model to the `{name, version, file_base_64,
  file_name}` payload the API will take, then awaits a 2000 ms stand-in for the
  request. The real call sits directly beneath it, commented, taking the same
  `payload` variable — so landing the endpoint is deleting two lines and
  uncommenting two.
- The delay is not decoration: it is the only reason the form's disabled fields
  and `Submitting…` label can be seen working before there is a server.
- Keeping the simulation *inside* the repository means the action, the screen
  and their tests are written against the final signature. Nothing above the
  domain knows the endpoint is missing.
- **Rejected** — stubbing at the action or screen level: the payload mapper
  would then have had no caller, and every layer above would have to be rewritten
  once the endpoint landed.
- **Cost** — commented-out code in `src/`, which the project's own policy
  otherwise forbids; a `DocumentError` branch no test can reach honestly, since
  the stand-in never rejects; and `@services/http` has no `post` yet, so the
  commented line will not compile as written until it does.

---

## Read the file through a port instead of letting the action import Expo
`2026-09-11` · `src/services/fileReader/` · `eslint.config.js`

> The action's job is to orchestrate. Knowing that base64 comes from
> `new File(uri).base64()` is not orchestration.

- `@services/fileReader` exposes one method, `readAsBase64(uri)`, and its Expo
  adapter is the only file in the project allowed to import `expo-file-system` —
  enforced by the same `no-restricted-imports` block that already guards the
  picker, storage, localization and i18n libraries.
- Failures come back as `FileReaderError` naming the uri, so the action never
  sees an Expo error type.
- Getting the uri there at all meant `InputDocument` had to stop reporting a file
  *name* and start reporting the whole `PickedDocumentModel`; the form now keeps
  `fileName` for what it paints and `fileUri` for what it sends.
- **Rejected** — faking the base64 too, since the endpoint is already faked: the
  encoding is the one part of this flow that is real work, and a fake would have
  hidden whether the picker's cached uri is readable at all.
- **Cost** — a new runtime dependency (`expo-file-system@57`), a fifth entry in
  every restricted-import list, and the whole file is held in memory as a base64
  string, which will not hold for large attachments.

---
