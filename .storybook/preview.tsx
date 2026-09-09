import '../src/global.css'

import { StyleSheet } from 'react-native'
import type { Preview } from '@storybook/react-native-web-vite'

import { ThemedView } from '@components/themed-view'
import { Spacing } from '@constants/theme'

const preview: Preview = {
  // Every story gets an auto-generated docs page from its props and JSDoc.
  tags: ['autodocs'],

  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    options: { storySort: { order: ['Overview', 'UI', ['Atoms', ['Icons', ['Gallery', '*']]]] } },
  },

  decorators: [
    (Story) => (
      <ThemedView style={styles.canvas}>
        <Story />
      </ThemedView>
    ),
  ],
}

const styles = StyleSheet.create({
  canvas: {
    padding: Spacing.four,
  },
})

export default preview
