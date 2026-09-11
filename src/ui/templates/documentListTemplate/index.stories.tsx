import { StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import {
  type DocumentListItemModel,
  DocumentListLayoutTypes,
  DocumentListSortTypes,
  DocumentListStateTypes,
  DocumentListTemplate,
} from '@ui/templates/documentListTemplate'

const STORY_FRAME_HEIGHT = 720

const STORY_FRAME_WIDTH = 390

const STORY_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: STORY_FRAME_WIDTH, height: STORY_FRAME_HEIGHT },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

const styles = StyleSheet.create({
  frame: {
    width: STORY_FRAME_WIDTH,
    height: STORY_FRAME_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Spacing.three,
    borderColor: Colors.border.default,
  },
})

const DOCUMENTS: readonly DocumentListItemModel[] = [
  {
    id: 'b763fe1e-469d-4422-9c31-6b9f1a02bdf1',
    title: 'St. Bernardus Abt 12',
    description: 'Version 1.14.2',
    contributors: ['Cyril Huels', 'Giovanni Runolfsson', 'Elton Fahey', 'Zula Willms'],
    attachments: ['German Wheat And Rye Beer', 'Scottish And Irish Ale', 'Amber Hybrid Beer'],
  },
  {
    id: '1c37b048-017c-4656-86cd-a3a5404300b8',
    title: 'Double Bastard Ale',
    description: 'Version 1.13.14',
    contributors: ['Edgar Turcotte', 'Euna Weimann', 'Stuart Williamson'],
    attachments: ['Light Lager', 'Belgian And French Ale', 'Vegetable Beer'],
  },
  {
    id: '8f8d1643-7d84-4099-9797-30511b7b0e55',
    title: 'Trois Pistoles',
    description: 'Version 3.2.16',
    contributors: ['Gus Gutkowski', 'Eliane Toy', 'Una Champlin', 'Dorian Okuneva'],
    attachments: ['Stout', 'Dark Lager'],
  },
  {
    id: '0c1d21e0-1851-4275-8089-eb2542a6bcab',
    title: 'Founders Kentucky Breakfast',
    description: 'Version 5.14.11',
    contributors: ['Emelia Zemlak', 'Tessie Hermiston'],
    attachments: ['Wood-aged Beer', 'Stout', 'English Brown Ale'],
  },
]

const meta = {
  title: 'UI/Templates/DocumentListTemplate',
  component: DocumentListTemplate,

  decorators: [
    (Story) => (
      <SafeAreaProvider initialMetrics={STORY_SAFE_AREA_METRICS}>
        <View style={styles.frame}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],

  parameters: {
    docs: {
      description: {
        component: [
          'The whole document list page: the title and its notification bell, the',
          'sort and layout controls, the documents themselves and the add button',
          'pinned at the bottom.',
          '',
          'It is one template for all three states, not three. Loading, error and',
          'content differ only in the block between the toolbar and the footer —',
          'everything around it is identical — so the states arrive as one',
          '`state` prop and the template swaps that block alone.',
          '',
          'Sort and layout are deliberately asymmetric. Sort reorders the documents,',
          'which the template does not own, so it is controlled from outside.',
          'Layout changes nothing beyond this page, so the template keeps it itself',
          'and `initialLayout` only says where it starts.',
          '',
          'The template holds its own copy. The atoms and molecules underneath it',
          'take plain strings and stay reusable; this page is rendered once, so it',
          'reads its labels from the translation catalogue rather than making the',
          'screen relay nine of them.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    state: {
      control: false,
      description: [
        'Loading, error or content. Content carries the documents, which may be an',
        'empty list — that is content with nothing in it, not a fourth state.',
      ].join(' '),
    },
    sort: {
      control: 'select',
      options: Object.values(DocumentListSortTypes),
      description: 'The selected sort criterion. Controlled — the template only reports changes.',
    },
    onSortChange: {
      control: false,
      description: 'Called with the new criterion when the sort menu is used.',
    },
    onAddDocument: {
      control: false,
      description: 'Called by the button at the bottom.',
    },
    onOpenNotifications: {
      control: false,
      description: 'Called by the bell in the header.',
    },
    notificationCount: {
      control: { type: 'number', min: 0, max: 99 },
      description: 'What the bell badge shows.',
    },
    initialLayout: {
      control: 'inline-radio',
      options: Object.values(DocumentListLayoutTypes),
      description: 'Which layout the page opens on. It is a starting point, not a lock.',
    },
  },

  args: {
    state: { type: DocumentListStateTypes.Content, documents: DOCUMENTS },
    sort: DocumentListSortTypes.Title,
    notificationCount: 3,
    onSortChange: () => {},
    onAddDocument: () => {},
    onOpenNotifications: () => {},
  },
} satisfies Meta<typeof DocumentListTemplate>

export default meta

type Story = StoryObj<typeof meta>

/** Four documents as a list, which is where the page opens. */
export const Default: Story = {}

/** The same four documents tiled two to a row. */
export const Grid: Story = {
  args: {
    initialLayout: DocumentListLayoutTypes.Grid,
  },
}

/** Fetching. The chrome stays put and only the body changes. */
export const Loading: Story = {
  args: {
    state: { type: DocumentListStateTypes.Loading },
  },
}

/** The fetch failed. The message comes from outside — the template does not write it. */
export const LoadError: Story = {
  args: {
    state: {
      type: DocumentListStateTypes.Error,
      message: 'The documents could not be loaded.',
    },
  },
}

/** Content with nothing in it. The list paints its own empty message. */
export const Empty: Story = {
  args: {
    state: { type: DocumentListStateTypes.Content, documents: [] },
  },
}

/** Nothing pending: the badge is empty and the bell carries the header alone. */
export const WithoutNotifications: Story = {
  args: {
    notificationCount: 0,
  },
}
