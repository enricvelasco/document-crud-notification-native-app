import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import {
  BellIcon,
  ChainIcon,
  DocumentIcon,
  GridIcon,
  ListIcon,
  SortIcon,
  UserGroupIcon,
} from '@ui/atoms/icons'
import { OptionsButton } from '@ui/molecules/optionsButton'

const VIEW_OPTIONS = [
  { value: 'grid', icon: GridIcon, accessibilityLabel: 'Grid view' },
  { value: 'list', icon: ListIcon, accessibilityLabel: 'List view' },
]

const TOOLBAR_OPTIONS = [
  { value: 'documents', icon: DocumentIcon, accessibilityLabel: 'Documents' },
  { value: 'contributors', icon: UserGroupIcon, accessibilityLabel: 'Contributors' },
  { value: 'links', icon: ChainIcon, accessibilityLabel: 'Links' },
  { value: 'notifications', icon: BellIcon, accessibilityLabel: 'Notifications' },
  { value: 'sort', icon: SortIcon, accessibilityLabel: 'Sort' },
]

const meta = {
  title: 'UI/Molecules/OptionsButton',
  component: OptionsButton,

  parameters: {
    docs: {
      description: {
        component: [
          'A segmented control: two or more icon options welded into one outlined box,',
          'exactly one of them active. Use it where the choices are peers and all of',
          'them fit on screen — a grid/list view switch is the canonical case. When the',
          'options need words, or there are more than a handful, reach for',
          '`DropdownButton` instead.',
          '',
          'It is a single box rather than a row of separate buttons, and that is what',
          'makes the choice legible: the options share one border, are divided by 1pt',
          'hairlines, and the active one is filled with `Colors.primary.light` and',
          'redrawn in `Colors.primary.default`. Colour is not carrying the meaning',
          'alone — the fill changes too, and each option reports its checked state to',
          'assistive technology through the surrounding `radiogroup`.',
          '',
          'The component is controlled and holds no state: it paints the `value` it is',
          'given and reports presses through `onChange`. Pressing the already-active',
          'option still fires — deciding whether that is a no-op or a toggle belongs to',
          'the caller, not to a button.',
          '',
          'Each option is a 48pt square, so the control is as wide as it needs to be',
          'and no wider — it never stretches to fill its parent.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    options: {
      control: false,
      description: [
        'The choices, left to right. Each carries a `value`, an `icon` component and',
        'an `accessibilityLabel` — the icon has no text, so the label is not optional.',
      ].join(' '),
    },
    value: {
      control: false,
      description: [
        'The `value` of the active option. A value matching none of the options paints',
        'nothing as active, which is a legitimate empty state.',
      ].join(' '),
    },
    onChange: {
      control: false,
      description: 'Fired with the pressed option `value`, including the already-active one.',
    },
    disabled: {
      control: 'boolean',
      description: 'Fades the whole control — border, hairlines and icons — and blocks presses.',
      table: { defaultValue: { summary: 'false' } },
    },
  },

  args: {
    options: VIEW_OPTIONS,
    value: 'grid',
    disabled: false,
    onChange: () => {},
  },
} satisfies Meta<typeof OptionsButton>

export default meta

type Story = StoryObj<typeof meta>

/** Grid active. The fill and the stroke colour change together. */
export const Default: Story = {}

/** The other one active. Nothing else about the box moves. */
export const ListSelected: Story = {
  args: {
    value: 'list',
  },
}

/** No option matches the value — a valid, if unusual, empty state. */
export const NothingSelected: Story = {
  args: {
    value: '',
  },
}

/** Faded box, faded hairlines, faded icons. The active fill goes with them. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/** More than two. The box grows; the options stay 48pt squares. */
export const ManyOptions: Story = {
  args: {
    options: TOOLBAR_OPTIONS,
    value: 'contributors',
  },
}

const ViewSwitcherExample = () => {
  const [value, setValue] = useState('grid')

  return (
    <View style={styles.row}>
      <OptionsButton options={VIEW_OPTIONS} value={value} onChange={setValue} />
      <Text style={styles.caption}>Showing the {value} view</Text>
    </View>
  )
}

/** Press either side. The active fill follows, and the label below reads the state back. */
export const Interactive: Story = {
  render: () => <ViewSwitcherExample />,
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  caption: {
    fontSize: 14,
    color: Colors.text.light,
  },
})
