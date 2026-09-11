# Development diary

Why this project is built the way it is. Each entry records a decision, the
alternative it beat and what it cost. Ordered oldest first.

> Spanish version: [DEVELOPMENT_DIARY_ES.md](./DEVELOPMENT_DIARY_ES.md)

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
  that directory is the only place `react-native-svg` is imported.
- **Rejected** — an icon font: it adds an asset to load and gives up per-icon
  control of stroke and colour.
- **Cost** — a component per icon, written by hand.

---

## Wrap AsyncStorage behind a project-owned storage port
`2026-09-10` · `src/services/storage/`

> Persistence is a replaceable implementation, so the app asks to store a value
> under a key and never learns who answers.

- `src/services/storage/` exposes `getItem` / `setItem` / `removeItem` /
  `clear` over our own `StorageServiceModel`, and `asyncStorageAdapter.ts` is
  the one file that imports the library.
- The port speaks values, not strings: the adapter owns the
  `JSON.stringify` / `JSON.parse`, so an unreadable stored value arrives as a
  `StorageError` at the boundary instead of a `SyntaxError` inside a screen.
- **Rejected** — a port that stores strings and leaves parsing to its callers:
  every call site then carries its own `JSON.parse` in a `try`/`catch` and
  decides for itself what a corrupt value means.
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

> **Partially superseded** on `2026-09-11` by [Lift the layout choice out of the template so it can be remembered](#lift-the-layout-choice-out-of-the-template-so-it-can-be-remembered) — layout is controlled from outside now too, so the asymmetry described above no longer holds.

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
  wrong one: the element Android clones as the scroll view's parent has to be
  the real control, so a wrapper would have to forward the `style` and
  `children` React Native injects, and the call site would need a cast.
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
  again opens a fresh one. That also makes the effect's double-invoke under
  StrictMode a non-event.
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
- **Rejected** — flagging only a `let` that is never reassigned, which is the
  case nobody gets wrong: it would leave untouched every binding the policy is
  actually about.
- **Cost** — the websocket and language adapters predate the rule and still
  hold state in loose bindings, so until they are reshaped the policy is
  unenforced and two shapes of closure coexist in `src/`.

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
  wiring.
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
`2026-09-11` · `src/services/fileReader/` · `src/core/actions/createDocumentAction/`

> The action's job is to orchestrate. Knowing that base64 comes from
> `new File(uri).base64()` is not orchestration.

- `@services/fileReader` exposes one method, `readAsBase64(uri)`, and its Expo
  adapter is the one file allowed to import `expo-file-system`.
- Failures come back as `FileReaderError` naming the uri, so the action never
  sees an Expo error type.
- Getting the uri there at all meant `InputDocument` had to stop reporting a file
  *name* and start reporting the whole `PickedDocumentModel`; the form now keeps
  `fileName` for what it paints and `fileUri` for what it sends.
- **Rejected** — faking the base64 too, since the endpoint is already faked: the
  encoding is the one part of this flow that is real work, and a fake would have
  hidden whether the picker's cached uri is readable at all.
- **Cost** — a new runtime dependency (`expo-file-system@57`), a fifth library
  confined to a single adapter, and the whole file is held in memory as a
  base64 string, which will not hold for large attachments.

---

## Lift the layout choice out of the template so it can be remembered
`2026-09-11` · `src/screens/documentListScreen/` · `src/ui/templates/documentListTemplate/`

> A preference that has to outlive the app cannot be kept by the component that
> paints it.

- The list/grid switch went back to `list` on every launch: the template held
  it in its own `useState`, and `initialLayout` was a prop no screen ever
  passed.
- Layout is now controlled exactly like sort — the screen owns the state,
  writes it to `@services/storage` on every change and reads it back on mount,
  so the template goes back to painting what it is given.
- The stored string is put through the template's own `isDocumentListLayout`
  before it is trusted, so a renamed layout or a hand-edited value falls back
  to `list` instead of reaching the toolbar as an unknown option.
- A failed read or write is logged and swallowed: a device that cannot keep a
  preference should still open the page.
- **Rejected** — leaving the state in the template and seeding it with
  `initialLayout` from storage: storage answers asynchronously, so the seed
  arrives after the first render, which is precisely when `useState` stops
  listening to it.
- **Cost** — changing layout now re-renders the screen rather than the template
  alone, and the first frame after launch always paints `list` before the
  stored value lands.

---

## Apply the sort in the template and reduce the criteria to name
`2026-09-11` · `src/ui/templates/documentListTemplate/` · `src/translations/`

> A sort control that only highlights the chosen option is a button that lies.

- `sort` travelled from the screen into the template and no further: it set the
  dropdown's selected value and was never used to order anything, so the list
  came out in whatever order the API returned.
- `Most recent` was a criterion the list could never honour —
  `DocumentListItemModel` carries id, title, description, contributors and
  attachments, and no date to compare — so the two options are now `nameAsc`
  and `nameDesc` over `title`.
- `sortDocumentList` sorts a copy with `localeCompare` and is applied in
  `DocumentListBody`, on the single path that hands documents to the list, so
  no state has to be kept in step with the criterion.
- **Rejected** — reordering in `documentListView` or asking the API for a
  sorted list: both turn a reorder of rows already on screen into a reload, and
  the view maps once on load by design.
- **Cost** — the array is copied and re-sorted on every render of the body
  rather than only when the criterion changes, and the criterion is
  deliberately not stored, so it resets on launch unlike the layout beside it.

---

## Accumulate the notification feed in the context, not just its count
`2026-09-11` · `src/context/notificationContext/` · `src/hooks/useNotifications.ts`

> A notification that is only counted is a notification nobody can ever read.

- The context exposed `count` and `isError` and nothing else, so every
  notification was logged to the console and then gone — the websocket is the
  only source and no repository can be asked for it again.
- `useNotificationSubscription` now keeps the notifications themselves, newest
  first, and `NotificationEntryModel` extends the domain model with an `id` the
  context assigns from the list length, because the payload carries none.
- **Rejected** — keying the list on `documentId` plus `timestamp`: two edits to
  the same document inside the same second collide, and the list then silently
  drops a row.
- **Rejected** — a `notificationListView` under `src/core/views/`: views exist
  to call repositories and map once on load, and this feed arrives by push with
  no load to map, so the screen maps it in its own `resources/`.
- **Cost** — the list grows for the life of the process with no cap and no
  eviction, so a session left open all day holds every notification in memory.

---

## Mark the notifications as read by opening their page
`2026-09-11` · `src/screens/notificationListScreen/` · `src/context/notificationContext/`

> Reading them is the only signal available, so it has to be the one that counts.

- The badge counted every notification the stream had ever delivered and
  nothing cleared it, so it only ever went up.
- The screen calls `markAsRead` once on mount and the context resets `count` to
  zero while keeping the accumulated list, which turns the badge into "unread
  since you last looked" and leaves the list as the complete record.
- **Rejected** — a `read` flag per notification: nothing in this feed is
  addressable, with no server id and no persistence, so per-item read state
  would be invented state that dies with the process regardless.
- **Cost** — a notification arriving while the page is open raises the badge
  again even though the user is looking straight at it.

---

## Report a dead subscription above the feed, not in place of it
`2026-09-11` · `src/ui/templates/notificationListTemplate/`

> Replacing the feed with its error message throws away the only copy of it.

- After three consecutive failures the stream controller closes the socket and
  the context flips `isError`; until now that only changed the bell badge, and
  the page behind it had no way to say what had happened.
- The template paints an alert banner with a reconnect button above the list,
  and the button calls `startSubscription`, which clears the error and opens a
  fresh socket.
- The notifications already received stay painted underneath, because a
  reconnect does not replay them and nothing else stores them.
- **Rejected** — swapping the body for an error state the way
  `documentListTemplate` does: there the documents can be fetched again, here
  the list on screen is the only copy that exists.
- **Cost** — the page can show a healthy-looking feed under a banner saying the
  feed is down, which is accurate but only if the banner is read.

---

## Own the network state behind a port instead of calling Expo's hook
`2026-09-11` · `src/services/network/` · `src/hooks/useNetworkState.ts`

> A hook every component calls on its own gives every component its own answer.

- `expo-network` ships `useNetworkState()`, but it opens one platform listener
  per component that calls it and returns a fresh object every render, so
  nothing downstream can share a reading or compare two of them.
- `networkService` wraps the library in the one adapter allowed to import it,
  holds a single snapshot, and opens the platform listener once — on the first
  subscriber — so `useNetworkState` is a `useSyncExternalStore` over one truth,
  the shape `useTranslate` already uses for the language.
- The snapshot is replaced only when `isOnline` or `status` actually change, so
  a repeated reading returns the same reference and re-renders nothing.
- The app starts optimistic (online, status unknown) and the first real reading
  lands asynchronously, so the offline notice cannot flash on a healthy launch.
- **Rejected** — `isInternetReachable` alone as the verdict: it stays
  `undefined` until Android validates the connection, which would read as
  offline for the first moments of every launch.
- **Cost** — a connection that is up but cannot reach the internet is only
  caught on Android; on iOS that field mirrors `isConnected`, so a captive
  portal goes unnoticed.

---

## Block the offline app with a sheet over the route, not a route of its own
`2026-09-11` · `src/ui/organisms/networkStatusGate/` · `src/ui/organisms/networkStatusSheet/` · `src/app/_layout.tsx`

> Navigating away from the route throws away the thing the user wants back.

- `NetworkStatusGate` is mounted once beside `<Stack>` in the root layout and
  paints nothing while the device is online, so there is a single wiring point
  and no screen has to know the network exists.
- Offline it fills the screen with `BottomSheet`, whose `onDismiss` is now
  optional: without it the overlay has no press target, so the sheet blocks
  everything behind it and the retry button is the only way out.
- The sheet reads no service and holds no state — it takes the status, whether
  a check is running, and the retry handler — so the gate owns every decision.
- **Rejected** — an `/offline` route pushed on disconnect: the route underneath
  is exactly what has to come back, and pushing would leave an offline screen in
  the history for the user to walk out of afterwards.
- **Cost** — the sheet covers the screen even for work that needs no network, so
  an unsent form draft is out of reach until the connection returns.

---

## Cut the stream on the network state and recover by replacing the route
`2026-09-11` · `src/context/notificationContext/` · `src/hooks/useAppNavigation.ts`

> A socket retrying into a dead network is a battery drain with a log line.

- `useNotificationSubscription` keys its effect on `isOnline` and, on the offline
  branch, calls `fail` rather than `stop`: losing the network takes the exact
  path three consecutive stream errors already took, so the socket closes, its
  reconnect timers go with it, and the feed reports itself unavailable instead of
  looking healthy but frozen.
- `fail` sits on the stream controller and not in the hook, because the
  controller owns the failure counter: it pins the count at the limit, so a late
  error from the socket it just closed cannot report the same outage twice.
- Dropping the network normally fails the stream three times first and leaves
  `isError` set, so coming back online clears it during render, where it is
  derived state and not a side effect — otherwise the feed would return healthy
  under a stale "disconnected" banner. The effect then opens a fresh socket.
- Losing the network is a state the app plans for now, so the stream reports its
  failures with `console.warn` rather than `console.error`: LogBox was painting a
  red crash box in dev for a condition that ends in a designed notice.
- `startSubscription` — the reconnect button on the notification page — refuses
  to run while offline, so the one public way back into the stream cannot reopen
  it underneath the notice.
- Retry asks `networkService.refresh()` for a fresh reading and only calls
  `refreshCurrentRoute` once it comes back online; that `router.replace`s the
  current pathname, and replace always mounts a new route key, so the screen
  re-runs its loaders where the user already was.
- **Rejected** — remounting the tree behind a changing key: the navigator's
  state lives in that tree, so the remount would drop the user on the first
  route instead of the one they lost.
- **Cost** — the retry re-runs the route from scratch, so anything the screen
  held that did not come from a repository goes with it.

---
## Raise the offline notice to window level so native sheets cannot cover it
`2026-09-11` · `src/ui/atoms/windowOverlay/`

> An overlay rendered in the React tree is still a child of the root view, and a
> native form sheet is not.

- `NetworkStatusGate` sat next to `<Stack>` in the root layout as an absolutely
  positioned `View`, which is above every *React* sibling but below anything
  UIKit presents on its own. The `new` route is declared `presentation:
  'formSheet'`, so losing the network while the document form was open left the
  notice painting underneath it — rendered, reachable by tests, invisible.
- A `WindowOverlay` atom now owns the placement: on iOS it wraps the children in
  `FullWindowOverlay`, which attaches its container straight to the `UIWindow`
  and therefore sits above the presented sheet's view controller; everywhere
  else it stays the same absolute `View` it always was.
- The platform split is a named predicate, `hasWindowLevelOverlay`, rather than
  an inline `Platform.OS` check or an `index.ios.tsx`, so the one reason the
  branch exists is stated in a place a test can reach — Jest runs a single
  project here and would never load the platform-suffixed file.
- Android keeps the plain `View` deliberately, not as a fallback: its form sheet
  is `BottomSheetBehavior` inside the same window, so the root-level overlay
  already draws on top and `FullWindowOverlay` would only log a warning.
- **Rejected** — wrapping the notice in React Native's `<Modal>`: it presents
  from `[self reactViewController]`, which on the `new` route is already
  presenting the form sheet, so UIKit would refuse the second presentation.
- **Cost** — the overlay's subtree lives outside the root view on iOS, so it is
  invisible to anything that walks the native hierarchy, and the branch has to
  be re-checked whenever `react-native-screens` changes how it presents sheets.

---

## Render the empty and the failed list through the same scrollable list
`2026-09-11` · `src/ui/templates/documentListTemplate/`

> A message painted beside the list instead of inside it has nothing to pull.

- The empty list could already be reloaded: `List` hands its `ListEmptyComponent`
  to the `FlatList` that carries the `RefreshControl`, so a list that came back
  with no documents always had the gesture. The failed one did not —
  `DocumentListBody` returned `DocumentListMessage` as a plain `View` beside the
  list, and a `View` does not scroll, so the one state where reloading is the
  only way forward was the one state that could not ask for it.
- Both no-document states now go through `DocumentListContent`: the error state
  passes zero documents and its own failure text as the empty message. The
  message the user reads is the same `DocumentListMessage` as before — only the
  container underneath it changed, from a sibling `View` to the list itself.
- Two named mappers carry the difference, so the body keeps one early return for
  loading and no nested branch: `toDocumentListDocuments` hands over documents
  only in the content state, and `toDocumentListEmptyMessage` prefers the failure
  reason over the translated "no documents yet".
- **Rejected** — giving `DocumentListMessage` its own `ScrollView` and a second
  `RefreshControl`: two refresh controls on one screen kept in step with a single
  `isRefreshing`, for a component that already had a scroll container one level
  up.
- **Cost** — the error message is now a `ListEmptyComponent`, so it inherits the
  list's `contentContainerStyle` and its column count; an error view that later
  wants its own spacing has to reckon with the grid it is rendered into.

---
