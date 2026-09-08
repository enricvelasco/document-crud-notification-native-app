# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

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

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
