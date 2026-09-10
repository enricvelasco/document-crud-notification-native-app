import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, UserGroupIcon } from '@ui/atoms/icons'

const meta = {
  title: 'UI/Atoms/Icons/UserGroupIcon',
  component: UserGroupIcon,

  parameters: {
    docs: {
      description: {
        component: [
          'Two people, one in front — contributors, or a shared document.',
          '',
          'Like every icon in `src/ui/atoms/icons/`, it takes the shared `IconModel`',
          'contract: one `size` (icons are square, so it drives both width and height)',
          'and one `color` (icons are single-colour line drawings, so it paints the',
          'whole glyph). Both are optional and fall back to the set-wide defaults.',
          '',
          'The stroke width is fixed in viewBox units, so it scales with `size`',
          'instead of getting heavier on small icons and thinner on large ones.',
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
} satisfies Meta<typeof UserGroupIcon>

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
      <UserGroupIcon size={16} color={color} />
      <UserGroupIcon size={24} color={color} />
      <UserGroupIcon size={32} color={color} />
      <UserGroupIcon size={48} color={color} />
      <UserGroupIcon size={64} color={color} />
    </View>
  ),
}

/** The whole glyph takes a single colour, so any theme token works. */
export const Palette: Story = {
  render: ({ size }) => (
    <View style={styles.row}>
      <UserGroupIcon size={size} color={Colors.text.default} />
      <UserGroupIcon size={size} color={Colors.text.light} />
      <UserGroupIcon size={size} color={Colors.primary.default} />
      <UserGroupIcon size={size} color={Colors.primary.dark} />
      <UserGroupIcon size={size} color={Colors.border.dark} />
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
