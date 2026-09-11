import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Spacing } from '@constants/theme'
import { CardGridItem } from '@ui/molecules/cardGridItem'

const meta = {
  title: 'UI/Molecules/CardGridItem',
  component: CardGridItem,

  parameters: {
    docs: {
      description: {
        component: [
          'One document as a grid tile: a title, and its description on the lines',
          'underneath. It is the cell of a card grid — several of them tiled read as a',
          'grid, which is the same content as a card list seen the other way round.',
          '',
          'The tile stretches to fill the column it is placed in, so a row of them comes',
          'out even however wide the screen is. Height it takes from its own content:',
          'the title wraps to two lines and the description to three before either one',
          'truncates, so a long name never grows the tile without bound.',
          '',
          'The component holds no state and makes no decisions — it paints the two',
          'strings it is handed. Laying the tiles out in columns is the caller\'s job.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    title: {
      control: 'text',
      description: 'The tile heading. Wraps to two lines, then truncates.',
    },
    description: {
      control: 'text',
      description: 'The supporting line underneath. Wraps to three lines, then truncates.',
    },
  },

  args: {
    title: 'Hop Rod Rye',
    description: 'A rye ale aged in whiskey barrels, brewed for the winter release.',
  },
} satisfies Meta<typeof CardGridItem>

export default meta

type Story = StoryObj<typeof meta>

/** A document with a short name and a one-line description. */
export const Default: Story = {}

/** Both fields long: the title wraps to two lines, the description to three. */
export const LongContent: Story = {
  args: {
    title: 'Hop Rod Rye Barrel-Aged Reserve Collection',
    description: [
      'A rye ale aged eighteen months in first-fill whiskey barrels, blended across',
      'three vintages and finished on toasted oak for the winter release, then held',
      'a further six months in bottle before it leaves the brewery.',
    ].join(' '),
  },
}

/** A brand new document: the title carries the tile on its own. */
export const Empty: Story = {
  args: {
    title: 'Untitled document',
    description: '',
  },
}

/** Tiled two to a row, which is how they are meant to be seen. */
export const Grid: Story = {
  render: () => (
    <View style={styles.grid}>
      <View style={styles.row}>
        <CardGridItem title="Hop Rod Rye" description="A rye ale aged in whiskey barrels." />
        <CardGridItem
          title="Bigfoot Barleywine"
          description="The 2026 vintage, bottled at the end of the cold season."
        />
      </View>
      <View style={styles.row}>
        <CardGridItem title="Pale Ale" description="The house recipe, unchanged since 1980." />
        <CardGridItem title="Porter" description="" />
      </View>
    </View>
  ),
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
})
