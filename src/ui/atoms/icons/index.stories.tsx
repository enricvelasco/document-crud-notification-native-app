import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import * as icons from '@ui/atoms/icons'

type IconEntryType = [string, ComponentType<icons.IconModel>]

const isIconEntry = ([name, value]: [string, unknown]) =>
  name.endsWith('Icon') && typeof value === 'function'

const matchesQuery = (name: string, query: string) =>
  name.toLowerCase().includes(query.trim().toLowerCase())

const ICON_ENTRIES = Object.entries(icons).filter(isIconEntry) as IconEntryType[]

const IconGallery = ({ size, color }: icons.IconModel) => {
  const [query, setQuery] = useState('')

  const matches = useMemo(() => ICON_ENTRIES.filter(([name]) => matchesQuery(name, query)), [query])

  return (
    <View style={styles.root}>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Filter icons by name"
        placeholderTextColor={Colors.text.light}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.count}>
        {matches.length} of {ICON_ENTRIES.length} icons
      </Text>

      {matches.length > 0 ? (
        <View style={styles.grid}>
          {matches.map(([name, Icon]) => (
            <View key={name} style={styles.cell}>
              <View style={styles.preview}>
                <Icon size={size} color={color} />
              </View>
              <Text style={styles.name}>{name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No icon matches “{query.trim()}”.</Text>
      )}
    </View>
  )
}

const meta = {
  title: 'UI/Atoms/Icons/Gallery',
  component: IconGallery,

  parameters: {
    docs: {
      description: {
        component: [
          'Every icon exported from `@ui/atoms/icons`, filtered live by name.',
          '',
          'The list is not maintained by hand: it reads the barrel at',
          '`src/ui/atoms/icons/index.ts` and keeps whatever export ends in `Icon`.',
          'Adding a line to that barrel is all it takes for a new icon to show up here.',
          '',
          'Use the `size` and `color` controls to preview the whole set at once —',
          'they are the shared `IconModel` contract, so they apply to every icon.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    size: {
      control: { type: 'range', min: 12, max: 96, step: 2 },
      description: 'Width and height in points, applied to every icon in the grid.',
      table: { defaultValue: { summary: `${icons.DEFAULT_ICON_SIZE} (Spacing.four)` } },
    },
    color: {
      control: 'color',
      description: 'The single colour every icon in the grid is drawn in.',
      table: { defaultValue: { summary: `${icons.DEFAULT_ICON_COLOR} (Colors.text.default)` } },
    },
  },

  args: {
    size: icons.DEFAULT_ICON_SIZE,
    color: icons.DEFAULT_ICON_COLOR,
  },
} satisfies Meta<typeof IconGallery>

export default meta

type Story = StoryObj<typeof meta>

/** Type in the field to filter; use the controls to resize and recolour the set. */
export const Default: Story = {}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  search: {
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    color: Colors.text.default,
  },
  count: {
    fontSize: 12,
    color: Colors.text.light,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  cell: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    minWidth: 120,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Spacing.two,
  },
  preview: {
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 12,
    color: Colors.text.light,
  },
  empty: {
    fontSize: 14,
    color: Colors.text.light,
  },
})
