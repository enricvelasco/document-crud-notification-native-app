import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Spacing } from '@constants/theme'
import { AddIcon, ChainIcon, DocumentIcon } from '@ui/atoms/icons'
import { PrimaryButton } from '@ui/atoms/primaryButton'
import { SecondaryButton } from '@ui/atoms/secondaryButton'

const meta = {
  title: 'UI/Atoms/SecondaryButton',
  component: SecondaryButton,

  parameters: {
    docs: {
      description: {
        component: [
          'The quieter sibling of `PrimaryButton` — a white button drawn with a',
          'border instead of a fill. It is the surface every other outlined control',
          'in the kit is built from: `BadgeButton`, `OptionsButton` and',
          '`DropdownButton` all repeat the same 48pt height, 1pt',
          '`Colors.border.default` edge and `Colors.background.default` ground.',
          '',
          'The API is deliberately identical to `PrimaryButton`, so swapping the',
          'emphasis of an action is a one-word change and nothing else moves. The',
          'icon is passed as the component (`icon={AddIcon}`), not as rendered JSX,',
          'which is what lets the button colour it — and dim it — along with the label.',
          '',
          'Because the fill is already white, `disabled` cannot mute it by going',
          'paler. It fades the border to `Colors.border.light` and the content to',
          '`Colors.border.dark` instead, and the pressed state darkens the ground to',
          '`Colors.background.light` rather than lightening it.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    label: {
      control: 'text',
      description: 'The text painted next to the icon.',
    },
    icon: {
      control: false,
      description: [
        'Optional icon component from `@ui/atoms/icons`, rendered to the left of',
        'the label. Passed as a reference (`AddIcon`), not as an element.',
      ].join(' '),
      table: { defaultValue: { summary: 'none' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Fades the border and content, and blocks presses.',
      table: { defaultValue: { summary: 'false' } },
    },
    onPress: {
      control: false,
      description: 'Fired on press. Never called while `disabled`.',
    },
  },

  args: {
    label: 'Share document',
    disabled: false,
    onPress: () => {},
  },
} satisfies Meta<typeof SecondaryButton>

export default meta

type Story = StoryObj<typeof meta>

/** Label only — the icon is optional. */
export const Default: Story = {}

/** With an icon on the left. The button sizes and colours it. */
export const WithIcon: Story = {
  args: {
    icon: ChainIcon,
  },
}

/** Faded border, faded label, and presses are ignored. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/** The four combinations. Press one to see `Colors.background.light`. */
export const States: Story = {
  render: ({ label, onPress }) => (
    <View style={styles.column}>
      <SecondaryButton label={label} onPress={onPress} />
      <SecondaryButton label={label} icon={ChainIcon} onPress={onPress} />
      <SecondaryButton label={label} disabled onPress={onPress} />
      <SecondaryButton label={label} icon={ChainIcon} disabled onPress={onPress} />
    </View>
  ),
}

/** Side by side with `PrimaryButton`: same box, same height, different emphasis. */
export const NextToPrimary: Story = {
  render: ({ onPress }) => (
    <View style={styles.row}>
      <SecondaryButton label="Cancel" onPress={onPress} />
      <PrimaryButton label="Add document" icon={AddIcon} onPress={onPress} />
    </View>
  ),
}

/** Too long for the width: truncated on one line, never taller. */
export const LongLabel: Story = {
  render: ({ onPress }) => (
    <View style={styles.narrow}>
      <SecondaryButton
        label="Share this document with every contributor"
        icon={ChainIcon}
        onPress={onPress}
      />
    </View>
  ),
}

/** Any icon sharing the `IconModel` contract drops in unchanged. */
export const Icons: Story = {
  render: ({ onPress }) => (
    <View style={styles.column}>
      <SecondaryButton label="Copy link" icon={ChainIcon} onPress={onPress} />
      <SecondaryButton label="Open document" icon={DocumentIcon} onPress={onPress} />
      <SecondaryButton label="Add document" icon={AddIcon} onPress={onPress} />
    </View>
  ),
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  narrow: {
    width: 260,
  },
})
