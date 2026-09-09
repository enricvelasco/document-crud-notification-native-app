import { StyleSheet } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { ThemedText } from '@components/themed-text'
import { ThemedView } from '@components/themed-view'
import { Collapsible } from '@components/ui/collapsible'
import { Spacing } from '@constants/theme'

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  argTypes: {
    title: {
      control: 'text',
      description: 'Label rendered next to the chevron, always visible.',
    },
    children: {
      control: false,
      description: 'Content revealed when the row is expanded.',
    },
  },
  args: {
    title: 'What is inside?',
    children: <ThemedText>Anything you pass as children shows up here.</ThemedText>,
  },
} satisfies Meta<typeof Collapsible>

export default meta

type Story = StoryObj<typeof meta>

/** Default collapsed state — press the row to expand it. */
export const Default: Story = {}

/** A long title wraps instead of pushing the chevron out of view. */
export const LongTitle: Story = {
  args: {
    title: 'A considerably longer title that has to share the row with the chevron',
  },
}

/** Several collapsibles stacked, each keeping its own open state. */
export const Stacked: Story = {
  render: (args) => (
    <ThemedView style={styles.stack}>
      <Collapsible {...args} title="First section" />
      <Collapsible {...args} title="Second section" />
      <Collapsible {...args} title="Third section" />
    </ThemedView>
  ),
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
})
