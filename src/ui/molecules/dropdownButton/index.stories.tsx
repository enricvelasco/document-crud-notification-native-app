import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { DocumentIcon, SortIcon, UserGroupIcon } from '@ui/atoms/icons'
import { DropdownButton } from '@ui/molecules/dropdownButton'

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name — ascending' },
  { value: 'name-desc', label: 'Name — descending' },
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
]

const OWNER_OPTIONS = [
  { value: 'anyone', label: 'Anyone' },
  { value: 'me', label: 'Owned by me' },
  { value: 'shared', label: 'Shared with me' },
]

const LONG_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: `chapter-${index + 1}`,
  label: `Chapter ${index + 1}`,
}))

const meta = {
  title: 'UI/Molecules/DropdownButton',
  component: DropdownButton,

  parameters: {
    docs: {
      description: {
        component: [
          'A split button: a label on the left, a chevron on the right, a hairline',
          'between them. Pressing anywhere on it opens a menu of text options. Use it',
          'where `OptionsButton` runs out — when the choices need words rather than',
          'icons, or when there are more of them than fit in a row. Sorting is the',
          'canonical case.',
          '',
          'The divider is the honest part of the design. It reads as a split button, so',
          'the chevron looks like it does something distinct — and it does not: the',
          'whole control is one press target. That is deliberate. A 44pt chevron that',
          'behaves identically to the label beside it is a bigger, more forgiving',
          'target than a real split would give, and there is no second action to hide',
          'behind it.',
          '',
          'The menu is a `Modal`, not an absolutely-positioned sibling, so it escapes',
          'any parent that would clip it and floats above everything. It is measured',
          'against the button in window coordinates each time it opens — so it follows',
          'the button after a scroll or a rotation instead of drifting — and it is',
          'clamped to the screen: it never runs off the right edge, and a list too tall',
          'for the space below scrolls rather than spilling. Pressing outside dismisses',
          'it, as does the Android back button.',
          '',
          'The button keeps showing `label`, not the selection; the menu is where the',
          'active option is marked. Which of the two a screen wants is a product',
          'decision, so it stays with the caller — pass a static `label` for a filter',
          'that names its own axis ("Sort"), or pass the selected option\'s label to',
          'have the button read back the choice. The Interactive story below does the',
          'latter.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    label: {
      control: 'text',
      description: 'The text on the button. It does not change when an option is picked.',
    },
    options: {
      control: false,
      description: 'The menu entries, top to bottom. Each carries a `value` and a `label`.',
    },
    value: {
      control: false,
      description: [
        'The `value` of the active option, marked in the menu. Optional — leave it out',
        'for a menu with nothing selected yet.',
      ].join(' '),
      table: { defaultValue: { summary: 'none' } },
    },
    onChange: {
      control: false,
      description: 'Fired with the chosen `value`. The menu closes first, then this fires.',
    },
    icon: {
      control: false,
      description: [
        'Optional icon component from `@ui/atoms/icons`, rendered left of the label.',
        'The trailing chevron is not configurable — it is what marks the control as a menu.',
      ].join(' '),
      table: { defaultValue: { summary: 'none' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Fades the border, the divider and the content, and stops the menu opening.',
      table: { defaultValue: { summary: 'false' } },
    },
  },

  args: {
    label: 'Sort',
    options: SORT_OPTIONS,
    value: 'name-asc',
    icon: SortIcon,
    disabled: false,
    onChange: () => {},
  },
} satisfies Meta<typeof DropdownButton>

export default meta

type Story = StoryObj<typeof meta>

/** Press it. The menu opens under the button with the active option marked. */
export const Default: Story = {}

/** Without a leading icon — the label carries the meaning on its own. */
export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    label: 'Sort by',
  },
}

/** No `value`: the menu opens with nothing marked. */
export const NothingSelected: Story = {
  args: {
    value: undefined,
  },
}

/** Faded, and the menu will not open. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/** More options than fit below the button: the menu clamps to the screen and scrolls. */
export const ScrollingMenu: Story = {
  args: {
    label: 'Jump to',
    options: LONG_OPTIONS,
    value: 'chapter-3',
    icon: DocumentIcon,
  },
}

/** Anchored near the right edge — the menu stays on screen instead of running off it. */
export const AgainstTheEdge: Story = {
  render: (args) => (
    <View style={styles.pushRight}>
      <DropdownButton {...args} />
    </View>
  ),
}

const SortExample = () => {
  const [value, setValue] = useState('name-asc')
  const selected = SORT_OPTIONS.find((option) => option.value === value)

  return (
    <View style={styles.column}>
      <DropdownButton
        label={selected ? selected.label : 'Sort'}
        options={SORT_OPTIONS}
        value={value}
        icon={SortIcon}
        onChange={setValue}
      />
      <Text style={styles.caption}>Sorting by {value}</Text>
    </View>
  )
}

/** The other half of the choice: here the caller feeds the selected label back into the button. */
export const Interactive: Story = {
  render: () => <SortExample />,
}

/** Two of them in a filter bar, each owning its own menu. */
export const FilterBar: Story = {
  render: ({ onChange }) => (
    <View style={styles.row}>
      <DropdownButton
        label="Sort"
        options={SORT_OPTIONS}
        value="date-desc"
        icon={SortIcon}
        onChange={onChange}
      />
      <DropdownButton
        label="Owner"
        options={OWNER_OPTIONS}
        value="me"
        icon={UserGroupIcon}
        onChange={onChange}
      />
    </View>
  ),
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  column: {
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  pushRight: {
    alignItems: 'flex-end',
  },
  caption: {
    fontSize: 14,
    color: Colors.text.light,
  },
})
