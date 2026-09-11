import { StyleSheet, Text } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { List } from '@ui/molecules/list'

interface ListStoryItemModel {
  id: string
  label: string
}

const ITEMS: readonly ListStoryItemModel[] = [
  { id: '1', label: 'St. Bernardus Abt 12' },
  { id: '2', label: 'Double Bastard Ale' },
  { id: '3', label: 'Trois Pistoles' },
  { id: '4', label: 'Founders Kentucky Breakfast' },
  { id: '5', label: 'Hop Rod Rye' },
  { id: '6', label: 'Bigfoot Barleywine' },
]

const styles = StyleSheet.create({
  row: {
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
    color: Colors.text.default,
  },
  empty: {
    padding: Spacing.four,
    textAlign: 'center',
    color: Colors.text.light,
  },
})

const renderRow = (item: ListStoryItemModel) => <Text style={styles.row}>{item.label}</Text>

const meta = {
  title: 'UI/Molecules/List',
  component: List,

  parameters: {
    docs: {
      description: {
        component: [
          'A collection painted as rows or as a grid. It is the one place in the app',
          'that talks to `FlatList`, so nothing above it has to learn that API — or',
          'remember to turn virtualisation on.',
          '',
          'The layout has a single knob: `columns`. One column is a list, two is a',
          'grid, and the same items and the same `renderItem` produce both — swapping',
          'between them is a number, not a second component. The `gap` applies in both',
          'directions, so rows and columns breathe the same amount.',
          '',
          'When `items` is empty the list paints `empty` instead, centred in the space',
          'the rows would have taken. The component holds no state and knows nothing',
          'about what it is listing.',
          '',
          'Pull to refresh is opt-in and controlled. Pass `onRefresh` and the list',
          'grows the gesture; leave it out and there is no spinner to pull down at',
          'all. `isRefreshing` is owned by the caller, because only the caller knows',
          'when its reload finished — the list never turns the spinner off by itself.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    items: {
      control: false,
      description: 'The collection to paint, in the order it should appear.',
    },
    renderItem: {
      control: false,
      description: 'Paints one item. Receives the item alone — no index, no separators.',
    },
    keyExtractor: {
      control: false,
      description: 'The stable identity of an item. Called once per item.',
    },
    columns: {
      control: { type: 'number', min: 1, max: 4 },
      description: 'How many items fit across. `1` is a list, `2` or more is a grid.',
    },
    gap: {
      control: { type: 'number', min: 0, max: 32 },
      description: 'Space between items, applied between rows and between columns alike.',
    },
    empty: {
      control: false,
      description: 'Painted in place of the rows when `items` is empty.',
    },
    isRefreshing: {
      control: 'boolean',
      description: 'Whether the pull-to-refresh spinner is showing. Controlled by the caller.',
    },
    onRefresh: {
      control: false,
      description: [
        'Called when the list is pulled down past the top. Omitting it removes the',
        'gesture entirely.',
      ].join(' '),
    },
  },

  args: {
    items: ITEMS,
    renderItem: renderRow,
    keyExtractor: (item: ListStoryItemModel) => item.id,
  },
} satisfies Meta<typeof List<ListStoryItemModel>>

export default meta

type Story = StoryObj<typeof meta>

/** One column: the rows stack and the gap separates them vertically. */
export const Default: Story = {}

/** Two columns: same items, same `renderItem`, one number changed. */
export const Grid: Story = {
  args: {
    columns: 2,
  },
}

/** Three across. The grid is not capped at two — the caller decides. */
export const ThreeColumns: Story = {
  args: {
    columns: 3,
  },
}

/** A wider gap opens the rows and the columns by the same amount. */
export const WideGap: Story = {
  args: {
    columns: 2,
    gap: Spacing.four,
  },
}

/** Nothing to list: `empty` takes the whole space instead of the rows. */
export const Empty: Story = {
  args: {
    items: [],
    empty: <Text style={styles.empty}>There are no documents yet.</Text>,
  },
}

/** Without an `empty`, an empty collection simply paints nothing. */
export const EmptyWithoutFallback: Story = {
  args: {
    items: [],
  },
}

/** With an `onRefresh`, pulling the rows down past the top asks for fresh data. */
export const PullToRefresh: Story = {
  args: {
    onRefresh: () => {},
  },
}

/** The reload is in flight: `isRefreshing` is the caller saying so, not the list. */
export const Refreshing: Story = {
  args: {
    isRefreshing: true,
    onRefresh: () => {},
  },
}

/** Nothing to list is still worth refreshing — the empty state pulls down too. */
export const EmptyPullToRefresh: Story = {
  args: {
    items: [],
    empty: <Text style={styles.empty}>There are no documents yet.</Text>,
    onRefresh: () => {},
  },
}
