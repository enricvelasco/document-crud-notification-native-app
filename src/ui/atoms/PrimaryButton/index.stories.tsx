import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Spacing } from '@constants/theme'
import { AddIcon, BellIcon, DocumentIcon } from '@ui/atoms/icons'
import { PrimaryButton } from '@ui/atoms/PrimaryButton'

const meta = {
  title: 'UI/Atoms/PrimaryButton',
  component: PrimaryButton,

  parameters: {
    docs: {
      description: {
        component: [
          'The primary call to action — a filled button on `Colors.primary.default`.',
          '',
          'It takes a `label` and, optionally, an `icon` placed to its left. The icon',
          'is passed as the component itself (`icon={AddIcon}`), not as rendered JSX,',
          'so the button stays in charge of the size and colour it is drawn at — that',
          'is what lets the icon dim along with the label when the button is disabled.',
          '',
          'The height is fixed, so a button with an icon and one without line up',
          'exactly — the icon is taller than the label, and a padding-driven height',
          'would let it push the button open. A label too long for the width is',
          'truncated on one line rather than wrapping out of the fixed box.',
          '',
          'Three visual states, all driven from the theme: the resting fill,',
          '`Colors.primary.dark` while pressed, and `Colors.primary.light` with muted',
          'content when `disabled`. Disabling also stops `onPress` firing and marks',
          'the control disabled for assistive technology.',
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
      description: 'Dims the button and blocks presses.',
      table: { defaultValue: { summary: 'false' } },
    },
    onPress: {
      control: false,
      description: 'Fired on press. Never called while `disabled`.',
    },
  },

  args: {
    label: 'Add document',
    disabled: false,
    onPress: () => {},
  },
} satisfies Meta<typeof PrimaryButton>

export default meta

type Story = StoryObj<typeof meta>

/** Label only — the icon is optional. */
export const Default: Story = {}

/** With an icon on the left. The button sizes and colours it. */
export const WithIcon: Story = {
  args: {
    icon: AddIcon,
  },
}

/** Muted fill, muted label, and presses are ignored. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/** Disabled with an icon — the icon dims with the label rather than staying bright. */
export const DisabledWithIcon: Story = {
  args: {
    icon: AddIcon,
    disabled: true,
  },
}

/** The four combinations. Every one is the same height. Press one to see `Colors.primary.dark`. */
export const States: Story = {
  render: ({ label, onPress }) => (
    <View style={styles.column}>
      <PrimaryButton label={label} onPress={onPress} />
      <PrimaryButton label={label} icon={AddIcon} onPress={onPress} />
      <PrimaryButton label={label} disabled onPress={onPress} />
      <PrimaryButton label={label} icon={AddIcon} disabled onPress={onPress} />
    </View>
  ),
}

/** Icon and no icon at the same height — the reason the height is fixed at 48pt. */
export const SameHeight: Story = {
  render: ({ onPress }) => (
    <View style={styles.row}>
      <PrimaryButton label="No icon" onPress={onPress} />
      <PrimaryButton label="With icon" icon={AddIcon} onPress={onPress} />
    </View>
  ),
}

/** Too long for the width: truncated on one line, never taller. */
export const LongLabel: Story = {
  render: ({ onPress }) => (
    <View style={styles.narrow}>
      <PrimaryButton
        label="Add a document and notify every contributor"
        icon={AddIcon}
        onPress={onPress}
      />
    </View>
  ),
}

/** Any icon sharing the `IconModel` contract drops in unchanged. */
export const Icons: Story = {
  render: ({ onPress }) => (
    <View style={styles.column}>
      <PrimaryButton label="Add document" icon={AddIcon} onPress={onPress} />
      <PrimaryButton label="Notify contributors" icon={BellIcon} onPress={onPress} />
      <PrimaryButton label="Open document" icon={DocumentIcon} onPress={onPress} />
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
