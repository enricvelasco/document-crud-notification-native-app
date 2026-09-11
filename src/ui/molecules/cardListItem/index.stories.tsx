import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Spacing } from '@constants/theme'
import {
  BellIcon,
  ChainIcon,
  DocumentIcon,
  UserGroupIcon,
} from '@ui/atoms/icons'
import type { CardListItemProps } from '@ui/molecules/cardListItem'
import { CardListItem } from '@ui/molecules/cardListItem'

const DOCUMENT_COLUMNS: CardListItemProps['columns'] = [
  {
    icon: UserGroupIcon,
    title: 'Contributors',
    items: ['Charlie', 'Zoe', 'Carmen', 'Americo'],
  },
  {
    icon: ChainIcon,
    title: 'Attachments',
    items: ['Light lager', 'Porter', 'Sour Ale', 'German Wheat'],
  },
]

const UNEVEN_COLUMNS: CardListItemProps['columns'] = [
  {
    icon: UserGroupIcon,
    title: 'Contributors',
    items: ['Charlie', 'Zoe'],
  },
  {
    icon: ChainIcon,
    title: 'Attachments',
    items: ['Light lager', 'Porter', 'Sour Ale', 'German Wheat', 'Barrel-aged Stout'],
  },
]

const meta = {
  title: 'UI/Molecules/CardListItem',
  component: CardListItem,

  parameters: {
    docs: {
      description: {
        component: [
          'One document as a card: a header row that names it, and two labelled',
          'columns of content underneath. It is the row of a card list — several of',
          'them stacked read as a list, not as four separate boxes.',
          '',
          'The header puts the title and the description on the same line, pushed to',
          'opposite edges. The title takes whatever room it needs and truncates first,',
          'so a long name never pushes the version off the card.',
          '',
          'Below it the two columns split the width evenly and each one paints its own',
          'icon, its own heading and its own list of lines. The columns are independent:',
          'they do not align row-by-row, and one can be longer than the other or empty',
          'entirely. The component holds no state and makes no decisions — it paints the',
          'columns it is handed, in the order it is handed them.',
          '',
          'Exactly two columns, enforced by the type. A card with one column or three is',
          'a different component, not a variant of this one.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    title: {
      control: 'text',
      description: 'The card heading, top left. Truncates before the description does.',
    },
    description: {
      control: 'text',
      description: 'The secondary line, top right — a version, a date, a status.',
    },
    columns: {
      control: false,
      description: [
        'The two columns, left to right. Each carries an `icon` component from',
        '`@ui/atoms/icons`, a `title` and its `items` — one line of text each.',
      ].join(' '),
    },
  },

  args: {
    title: 'Hop Rod Rye',
    description: 'Version 2.6.17',
    columns: DOCUMENT_COLUMNS,
  },
} satisfies Meta<typeof CardListItem>

export default meta

type Story = StoryObj<typeof meta>

/** A document with four contributors and four attachments. */
export const Default: Story = {}

/** The columns are independent lists — the card ends where the longer one ends. */
export const UnevenColumns: Story = {
  args: {
    columns: UNEVEN_COLUMNS,
  },
}

/** Nothing attached yet. The heading stays, the list below it is simply absent. */
export const EmptyColumn: Story = {
  args: {
    columns: [
      DOCUMENT_COLUMNS[0],
      { icon: ChainIcon, title: 'Attachments', items: [] },
    ],
  },
}

/** A brand new document: both columns empty, the header carrying the card alone. */
export const Empty: Story = {
  args: {
    title: 'Untitled document',
    description: 'Version 1.0.0',
    columns: [
      { icon: UserGroupIcon, title: 'Contributors', items: [] },
      { icon: ChainIcon, title: 'Attachments', items: [] },
    ],
  },
}

/** Long text truncates to one line everywhere rather than reflowing the card. */
export const LongContent: Story = {
  args: {
    title: 'Hop Rod Rye Barrel-Aged Reserve Collection',
    description: 'Version 12.4.108-beta',
    columns: [
      {
        icon: UserGroupIcon,
        title: 'Contributors and reviewers',
        items: ['Charlie Bartholomew Fitzgerald', 'Zoe', 'Carmen'],
      },
      {
        icon: ChainIcon,
        title: 'Attachments',
        items: ['Light lager tasting notes, final revision', 'Porter'],
      },
    ],
  },
}

/** Any icon pair works — the column heading is whatever the caller names it. */
export const OtherIcons: Story = {
  args: {
    columns: [
      { icon: DocumentIcon, title: 'Documents', items: ['Recipe', 'Label artwork'] },
      { icon: BellIcon, title: 'Notifications', items: ['Review requested', 'Version published'] },
    ],
  },
}

/** Stacked, which is how they are meant to be seen. */
export const List: Story = {
  render: () => (
    <View style={styles.list}>
      <CardListItem title="Hop Rod Rye" description="Version 2.6.17" columns={DOCUMENT_COLUMNS} />
      <CardListItem title="Bigfoot Barleywine" description="Version 1.0.3" columns={UNEVEN_COLUMNS} />
      <CardListItem
        title="Pale Ale"
        description="Version 4.2.0"
        columns={[
          { icon: UserGroupIcon, title: 'Contributors', items: ['Americo'] },
          { icon: ChainIcon, title: 'Attachments', items: [] },
        ]}
      />
    </View>
  ),
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
})
