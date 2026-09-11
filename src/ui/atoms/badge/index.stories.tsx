import { StyleSheet, Text, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import {
  Badge,
  BADGE_ERROR_LABEL,
  BADGE_MAX_COUNT,
  BADGE_OVERFLOW_LABEL,
} from '@ui/atoms/badge'

const meta = {
  title: 'UI/Atoms/Badge',
  component: Badge,

  parameters: {
    docs: {
      description: {
        component: [
          'A count pill. It exists to sit on the corner of something else — see',
          '`BadgeButton`, which is exactly that — so it draws itself and nothing more:',
          'no positioning, no anchor, no opinion about what it is counting.',
          '',
          `Counts above ${BADGE_MAX_COUNT} collapse to \`${BADGE_OVERFLOW_LABEL}\`. The cap keeps the pill from`,
          'growing without bound and pushing whatever it is pinned to out of shape —',
          'a notification count is a signal, not a number anyone reads precisely. The',
          'cap and its label live together in one constant, so they cannot drift apart.',
          '',
          'A count of zero renders nothing at all rather than an empty circle, so a',
          'consumer never has to guard the badge itself — mount it unconditionally',
          'and let the count decide.',
          '',
          `Error is the exception to that rule: \`isError\` paints the pill red and`,
          `replaces the number with \`${BADGE_ERROR_LABEL}\`, and it shows at a count of zero too.`,
          'A count that cannot be trusted is worse than no count — a stale number',
          'reads as truth, whereas the red pill says the figure is unavailable. The',
          'count is ignored rather than hidden, so the consumer keeps passing it and',
          'the badge goes back to the number the moment the error clears.',
          '',
          'The 2pt ring is painted in `Colors.background.default`, not left',
          'transparent. That is what keeps the pill legible when it overlaps a border',
          'or an icon underneath instead of blending into it.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    count: {
      control: { type: 'number', min: 0, max: 200, step: 1 },
      description: [
        `The number shown. Zero (or less) renders nothing; anything above`,
        `${BADGE_MAX_COUNT} renders \`${BADGE_OVERFLOW_LABEL}\`.`,
      ].join(' '),
    },
    isError: {
      control: 'boolean',
      description: [
        `Paints the pill \`Colors.error.default\` and shows \`${BADGE_ERROR_LABEL}\` instead of the count.`,
        'Visible even at zero.',
      ].join(' '),
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: [
        'Drops the fill to `Colors.border.dark` so the pill mutes with its host control.',
        'Wins over `isError`, matching the icon that greys out beside it.',
      ].join(' '),
      table: { defaultValue: { summary: 'false' } },
    },
  },

  args: {
    count: 3,
    isError: false,
    disabled: false,
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

/** A single digit — the pill is a circle at its minimum width. */
export const Default: Story = {}

/** Two digits. The pill grows sideways; the height never changes. */
export const TwoDigits: Story = {
  args: {
    count: 42,
  },
}

/** At the cap. One more and it collapses. */
export const AtTheCap: Story = {
  args: {
    count: BADGE_MAX_COUNT,
  },
}

/** Over the cap — and every value above it renders identically. */
export const Overflowing: Story = {
  args: {
    count: 1284,
  },
}

/** Nothing to count, nothing painted. The story is intentionally empty. */
export const Empty: Story = {
  args: {
    count: 0,
  },
}

/** The count could not be trusted, so it is not shown at all. */
export const ErrorState: Story = {
  args: {
    count: 8,
    isError: true,
  },
}

/** An error with nothing counted yet still paints — this is the one case zero is visible. */
export const ErrorAtZero: Story = {
  args: {
    count: 0,
    isError: true,
  },
}

/** Muted alongside a disabled host control. */
export const Disabled: Story = {
  args: {
    count: 7,
    disabled: true,
  },
}

/** Disabled wins: an inert control does not shout in red. */
export const ErrorDisabled: Story = {
  args: {
    count: 8,
    isError: true,
    disabled: true,
  },
}

/** The whole range in one row: hidden, circle, wider, capped. */
export const Scale: Story = {
  render: ({ disabled }) => (
    <View style={styles.row}>
      {[0, 1, 9, 10, 99, 100].map((count) => (
        <View key={count} style={styles.sample}>
          <Badge count={count} disabled={disabled} />
          <Text style={styles.caption}>{count}</Text>
        </View>
      ))}
    </View>
  ),
}

/** Count beside error: same pill, two meanings, told apart by colour alone. */
export const States: Story = {
  render: ({ count }) => (
    <View style={styles.row}>
      <View style={styles.sample}>
        <Badge count={count} />
        <Text style={styles.caption}>count</Text>
      </View>
      <View style={styles.sample}>
        <Badge count={count} isError />
        <Text style={styles.caption}>error</Text>
      </View>
      <View style={styles.sample}>
        <Badge count={count} disabled />
        <Text style={styles.caption}>disabled</Text>
      </View>
    </View>
  ),
}

/** The white ring at work: the pill stays readable on any ground. */
export const OnColour: Story = {
  render: ({ count }) => (
    <View style={styles.row}>
      <View style={[styles.swatch, styles.swatchLight]}><Badge count={count} /></View>
      <View style={[styles.swatch, styles.swatchDark]}><Badge count={count} /></View>
      <View style={[styles.swatch, styles.swatchPrimary]}><Badge count={count} /></View>
    </View>
  ),
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  sample: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  caption: {
    fontSize: 11,
    color: Colors.text.light,
  },
  swatch: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  swatchLight: {
    backgroundColor: Colors.background.light,
  },
  swatchDark: {
    backgroundColor: Colors.background.dark,
  },
  swatchPrimary: {
    backgroundColor: Colors.primary.light,
  },
})
