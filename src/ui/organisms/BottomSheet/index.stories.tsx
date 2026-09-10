import { StyleSheet, Text, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { BottomSheet } from '@ui/organisms/BottomSheet'

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.default,
  },
  filled: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  row: {
    fontSize: 16,
    color: Colors.text.default,
  },
})

const meta = {
  title: 'UI/Organisms/BottomSheet',
  component: BottomSheet,

  parameters: {
    docs: {
      description: {
        component: [
          'A panel anchored to the bottom of the screen, half the screen tall, spanning',
          'the full width, over a dimmed overlay that dismisses it when pressed.',
          '',
          'It replaces the native `formSheet` presentation: from iOS 26 a system sheet',
          'with a partial detent floats inset from the screen edges and only attaches to',
          'the sides and bottom at its largest detent, so half height and flush edges',
          'cannot both be had natively. This component paints the sheet itself instead.',
          '',
          'It holds no state and decides nothing — the caller renders it while the route',
          'is open and handles `onDismiss`.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    onDismiss: {
      description: 'Called when the overlay above the sheet is pressed.',
    },
  },

  args: {
    onDismiss: () => {},
    children: (
      <View style={styles.content}>
        <Text style={styles.title}>detalle</Text>
      </View>
    ),
  },
} satisfies Meta<typeof BottomSheet>

export default meta

type Story = StoryObj<typeof meta>

/** The sheet as the detail route paints it. */
export const Default: Story = {}

/** Content that fills the sheet rather than sitting in the middle of it. */
export const FilledContent: Story = {
  args: {
    children: (
      <View style={styles.filled}>
        {['Primero', 'Segundo', 'Tercero'].map((label) => (
          <Text key={label} style={styles.row}>{label}</Text>
        ))}
      </View>
    ),
  },
}
