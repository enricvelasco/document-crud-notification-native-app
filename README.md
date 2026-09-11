# Document CRUD & notifications

An [Expo](https://expo.dev) (SDK 57) React Native app: a document list with
create, sort and list/grid layout, plus a live notification feed over WebSocket.

> **The UI is documented in Storybook.** Every component in `src/ui/` — from
> the icons up to the full page templates — has a story with its states laid
> out side by side and an auto-generated props page. It is the fastest way to
> see what this app is made of without launching it: **`yarn storybook`**.
> [Details below](#ui-documentation--storybook).

| Document | What it covers | |
|---|---|---|
| **App flow** | What the app does, screen by screen, with screenshots and what runs underneath each one | [EN](./APP_FLOW.md) · [ES](./APP_FLOW_ES.md) |
| **Development diary** | Why it is built this way — each decision, the alternative it beat and what it cost | [EN](./DEVELOPMENT_DIARY_EN.md) · [ES](./DEVELOPMENT_DIARY_ES.md) |

## Requirements

| Tool | Needed for |
|---|---|
| Node 20+ and Yarn | the app |
| [Go](https://go.dev/dl/) | the mock backend |
| Xcode + Command Line Tools | the iOS simulator (macOS only) |
| Android Studio (SDK + an AVD) | the Android emulator |

## 1. Start the backend

The app talks to the mock server from
[holdedlab/frontend-challenge](https://github.com/holdedlab/frontend-challenge).
It serves both the REST endpoints and the notification WebSocket, so **nothing
in the app works until it is running**.

```bash
git clone https://github.com/holdedlab/frontend-challenge.git
cd frontend-challenge
go run server.go -addr localhost:9090
```

Leave it running in its own terminal. The port matters: `env/local.env` points
at `http://localhost:9090` and `ws://localhost:9090`, so a different `-addr`
means editing `env/local.env.local` to match.

## 2. Install dependencies

```bash
yarn install
```

## 3. Start the app

```bash
yarn start      # Metro, then press a / i / w to open a target
yarn android    # boot straight into the Android emulator
yarn ios        # boot straight into the iOS simulator
yarn web        # browser
```

`APP_ENV` defaults to `local`, which is the only environment pointing at a real
service — see [env/README.md](./env/README.md) for the others.

### Android emulator

The emulator's `localhost` is the emulator itself, not your machine, so the
loopback URLs in `env/local.env` need a bridge:

```bash
emulator -list-avds                     # or Android Studio ▸ Device Manager
emulator -avd <avd-name>                # boot it and wait for the home screen

adb reverse tcp:9090 tcp:9090           # host:9090 reachable as localhost:9090

yarn android
```

`adb reverse` is per-boot: re-run it every time the emulator restarts. If
`emulator` is not on your `PATH`, it lives at `$ANDROID_HOME/emulator/emulator`.

### iOS simulator

The simulator shares the host's network, so `localhost:9090` resolves with no
extra step:

```bash
xcrun simctl list devices available     # pick a booted or bootable device
open -a Simulator                       # optional: yarn ios boots one anyway

yarn ios
```

### Physical device

Loopback is not reachable from a phone. Bind the server to your LAN
(`go run server.go -addr 0.0.0.0:9090`) and point the app at your machine's IP
in `env/local.env.local` (gitignored):

```bash
API_URL=http://192.168.1.42:9090
WEB_SOCKET_URL=ws://192.168.1.42:9090
```

## UI documentation — Storybook

The design system documents itself. **29 stories** cover the whole atomic-design
ladder in `src/ui/`, and no backend, emulator or Metro bundler is involved:

```bash
yarn storybook          # http://localhost:6006
yarn storybook:build    # static export into storybook-static/ (gitignored)
```

What you get there:

- **Every component, every state, side by side.** A button's disabled and
  pressed variants, the list as one column and as a grid, and the three page
  templates (`documentListTemplate`, `newDocumentFormTemplate`,
  `notificationListTemplate`) in each of their loading / error / content states
  — states that are otherwise hard to reach by clicking through the app.
- **A generated props page per component.** `autodocs` is on globally, so the
  props table, its types and the JSDoc written on them are rendered for every
  story with nothing to maintain by hand. This is the one place the project's
  no-comments policy makes an exception for JSDoc: there it is product
  documentation, not a comment.
- **Live controls.** Props are editable in the panel, so a component can be
  driven into a state without writing code.

It runs on Vite + `react-native-web`, entirely separate from the Expo/Metro
build, and **is never bundled into the app** — `yarn storybook` is the only way
in. That separation is deliberate, and so is the fact that the components were
built here *before* the screens existed: see
[*Build the UI in Storybook before the screens exist*](./DEVELOPMENT_DIARY_EN.md)
in the diary.

Adding a component means adding its `index.stories.tsx` beside it — the glob in
`.storybook/main.ts` picks up anything under `src/ui/`.

## Checks

```bash
yarn lint        # ESLint is the style guide: no semicolons, arrow-function
                 # consts, max 2 params, sorted imports, enforced port boundaries
yarn typecheck
yarn test
```

## Import aliases

Every top-level folder under `src/` (plus `assets/`) is reachable through an
`@`-prefixed alias, so imports never walk up the tree:

```ts
import { httpService } from '@services/http'
import { useTheme } from '@hooks/use-theme'
import { getDocumentList } from '@core/domains/document'
```

`compilerOptions.paths` in **tsconfig.json** is the single source of truth.
Metro reads it directly (Expo's `experiments.tsconfigPaths`, on by default) and
**jest.config.js** derives its `moduleNameMapper` from it, so an alias is
declared in exactly one place.

### Adding a new alias

Add the folder to `compilerOptions.paths` in **tsconfig.json**:

```json
"@utils/*": ["./src/utils/*"]
```

Add a second, wildcard-free entry only when the folder has a barrel `index.ts`
you want to import bare — that is why `@config` and `@translations` are listed
twice:

```json
"@utils": ["./src/utils"],
"@utils/*": ["./src/utils/*"]
```

Restart the Expo CLI afterwards to pick up the change (clearing the Metro cache
is not needed). Nothing else to touch: TypeScript, Metro and Jest all follow.

## Learn more

- [Expo documentation](https://docs.expo.dev/versions/v57.0.0/) — the exact
  versioned docs this project is written against.
- [Expo Router](https://docs.expo.dev/router/introduction) — routes live in
  `src/app/`.
