import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { CloseIcon, DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from '@ui/atoms/icons'

const meta = {
  title: 'UI/Atoms/Icons/CloseIcon',
  component: CloseIcon,

  parameters: {
    docs: {
      description: {
        component: [
          'Two crossed strokes — the "dismiss" affordance.',
          '',
          'It shares the `IconModel` contract with every other icon in',
          '`src/ui/atoms/icons/`: one `size` (icons are square, so it drives both',
          'width and height) and one `color` (a single-colour line drawing, so it',
          'paints the whole glyph). Both fall back to the set-wide defaults.',
          '',
          'The two strokes are drawn corner to corner inside the shared viewBox, so',
          'the cross keeps the same optical weight as the plus in `AddIcon` at every',
          'size instead of being redrawn per size.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    size: {
      control: { type: 'range', min: 12, max: 96, step: 2 },
      description: 'Width and height in points. Icons are square, so one value covers both.',
      table: { defaultValue: { summary: `${DEFAULT_ICON_SIZE} (Spacing.four)` } },
    },
    color: {
      control: 'color',
      description: 'The single colour the whole glyph is drawn in.',
      table: { defaultValue: { summary: `${DEFAULT_ICON_COLOR} (Colors.text.default)` } },
    },
  },

  args: {
    size: DEFAULT_ICON_SIZE,
    color: DEFAULT_ICON_COLOR,
  },
} satisfies Meta<typeof CloseIcon>

export default meta

type Story = StoryObj<typeof meta>

/** Unconfigured — 24pt in `Colors.text.default`. */
export const Default: Story = {
  args: {
    size: undefined,
    color: undefined,
  },
}

/** One stroke width across the range: it scales with `size` instead of being redrawn. */
export const Sizes: Story = {
  render: ({ color }) => (
    <View style={styles.row}>
      <CloseIcon size={16} color={color} />
      <CloseIcon size={24} color={color} />
      <CloseIcon size={32} color={color} />
      <CloseIcon size={48} color={color} />
      <CloseIcon size={64} color={color} />
    </View>
  ),
}

/** The whole glyph takes a single colour, so any theme token works. */
export const Palette: Story = {
  render: ({ size }) => (
    <View style={styles.row}>
      <CloseIcon size={size} color={Colors.text.default} />
      <CloseIcon size={size} color={Colors.text.light} />
      <CloseIcon size={size} color={Colors.primary.default} />
      <CloseIcon size={size} color={Colors.primary.dark} />
      <CloseIcon size={size} color={Colors.border.dark} />
    </View>
  ),
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
})
