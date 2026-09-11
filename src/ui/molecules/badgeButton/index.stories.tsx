import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { BADGE_ERROR_LABEL, BADGE_MAX_COUNT, BADGE_OVERFLOW_LABEL } from '@ui/atoms/badge'
import { BellIcon, DocumentIcon, UserGroupIcon } from '@ui/atoms/icons'
import { BadgeButton } from '@ui/molecules/badgeButton'

const meta = {
  title: 'UI/Molecules/BadgeButton',
  component: BadgeButton,

  parameters: {
    docs: {
      description: {
        component: [
          'An icon-only button on the `SecondaryButton` surface, with a `Badge`',
          'pinned to its top-right corner. The pairing is the whole point: the icon',
          'says what the button opens, the badge says how much is waiting there.',
          '',
          'The button is square — 48pt, the same height as every other control in the',
          'kit — so it lines up in a toolbar next to a `SecondaryButton` or an',
          '`OptionsButton` without any of them being nudged.',
          '',
          `Counting is delegated: the badge hides itself at zero and collapses above ${BADGE_MAX_COUNT}`,
          `to \`${BADGE_OVERFLOW_LABEL}\`, so this component never branches on the count. It just`,
          'passes it down. The badge overhangs the border by 2pt and is not hit-testable,',
          'so pressing it presses the button underneath rather than swallowing the tap.',
          '',
          `\`isError\` hands the badge its error state: red, \`${BADGE_ERROR_LABEL}\`, and visible even`,
          'at zero. The button itself stays pressable — the counter is broken, not the',
          'destination — so the user can still open the screen and find out why.',
          '',
          'With no label to read, `accessibilityLabel` is required rather than optional —',
          'an icon alone is not a name. Pass a different one when `isError` is set: the',
          'red pill is invisible to a screen reader, so the label is the only place the',
          'error can be announced.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    icon: {
      control: false,
      description: [
        'The icon component from `@ui/atoms/icons`, centred in the button. Passed as',
        'a reference (`BellIcon`), not as an element, so the button colours it.',
      ].join(' '),
    },
    count: {
      control: { type: 'number', min: 0, max: 200, step: 1 },
      description: 'Handed straight to the badge. Zero hides it.',
    },
    accessibilityLabel: {
      control: 'text',
      description: 'Required — the button has no visible text to announce.',
    },
    isError: {
      control: 'boolean',
      description: 'Handed straight to the badge — red pill, no count, shown even at zero.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Fades the border, the icon and the badge together, and blocks presses.',
      table: { defaultValue: { summary: 'false' } },
    },
    onPress: {
      control: false,
      description: 'Fired on press, including a press that lands on the badge. Never called while `disabled`.',
    },
  },

  args: {
    icon: BellIcon,
    count: 3,
    accessibilityLabel: 'Notifications',
    isError: false,
    disabled: false,
    onPress: () => {},
  },
} satisfies Meta<typeof BadgeButton>

export default meta

type Story = StoryObj<typeof meta>

/** A bell with three notifications waiting. */
export const Default: Story = {}

/** Nothing waiting — the badge is gone, the button is unchanged. */
export const Empty: Story = {
  args: {
    count: 0,
  },
}

/** Two digits. The badge grows to the left and the button does not move. */
export const TwoDigits: Story = {
  args: {
    count: 24,
  },
}

/** Past the cap. */
export const Overflowing: Story = {
  args: {
    count: 350,
  },
}

/** The count is unavailable. Still pressable — the screen behind it may explain why. */
export const ErrorState: Story = {
  args: {
    count: 5,
    isError: true,
    accessibilityLabel: 'Notifications unavailable',
  },
}

/** Nothing counted and the feed is down — the badge appears anyway. */
export const ErrorAtZero: Story = {
  args: {
    count: 0,
    isError: true,
    accessibilityLabel: 'Notifications unavailable',
  },
}

/** Icon and badge fade together rather than the badge staying bright. */
export const Disabled: Story = {
  args: {
    count: 12,
    disabled: true,
  },
}

/** The counts side by side. Every button is the same 48pt square. */
export const Counts: Story = {
  render: ({ icon, accessibilityLabel, onPress }) => (
    <View style={styles.row}>
      {[0, 1, 9, 42, 128].map((count) => (
        <View key={count} style={styles.sample}>
          <BadgeButton
            icon={icon}
            count={count}
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
          />
          <Text style={styles.caption}>{count}</Text>
        </View>
      ))}
    </View>
  ),
}

/** A toolbar row: whatever the icon, the box is identical. */
export const Icons: Story = {
  render: ({ onPress }) => (
    <View style={styles.row}>
      <BadgeButton icon={BellIcon} count={3} accessibilityLabel="Notifications" onPress={onPress} />
      <BadgeButton icon={DocumentIcon} count={12} accessibilityLabel="Documents" onPress={onPress} />
      <BadgeButton icon={UserGroupIcon} count={0} accessibilityLabel="Contributors" onPress={onPress} />
    </View>
  ),
}

const NotificationsExample = () => {
  const [count, setCount] = useState(0)

  return (
    <View style={styles.row}>
      <BadgeButton
        icon={BellIcon}
        count={count}
        accessibilityLabel="Notifications"
        onPress={() => setCount(count + 1)}
      />
      <Text style={styles.caption}>Press to add one. Keep going past {BADGE_MAX_COUNT}.</Text>
    </View>
  )
}

/** Press it. The badge appears at one, widens at ten, and caps at the limit. */
export const Interactive: Story = {
  render: () => <NotificationsExample />,
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  sample: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  caption: {
    fontSize: 11,
    color: Colors.text.light,
  },
})
