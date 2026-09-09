import type { StorybookConfig } from '@storybook/react-native-web-vite'

// Local-only design documentation: Storybook renders every story and MDX page
// found under src/ui/ and src/components/ui/. It is never bundled into the Expo
// app — `yarn storybook` is the only entry point.
const config: StorybookConfig = {
  stories: [
    '../src/ui/**/*.mdx',
    '../src/ui/**/*.stories.@(ts|tsx)',
    '../src/components/ui/**/*.mdx',
    '../src/components/ui/**/*.stories.@(ts|tsx)',
  ],

  addons: ['@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      // These ship untranspiled React Native source, so Vite has to compile
      // them before react-native-web can run them in the browser.
      modulesToTranspile: [
        'react-native-reanimated',
        'react-native-worklets',
        'react-native-gesture-handler',
      ],
    },
  },

  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite')

    return mergeConfig(config, {
      optimizeDeps: {
        // Some react-native APIs simply do not exist on the web —
        // `PlatformColor`, for one — yet expo packages still import them by
        // name behind a `Platform.OS` check that is never true here. The
        // production build already shims those away; the dependency
        // pre-bundler does not, and refuses to start without this.
        rolldownOptions: { shimMissingExports: true },
      },
    })
  },
}

export default config
