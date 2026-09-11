import { StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { type NotificationListItemModel, NotificationListTemplate } from '@ui/templates/notificationListTemplate'

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

const NOTIFICATIONS: readonly NotificationListItemModel[] = [
  {
    id: '2-f09acc46',
    title: 'Edmund Fitzgerald Porter',
    description: 'Updated by Alicia Wolf',
    timestamp: '12 Aug 2020, 07:30',
  },
  {
    id: '1-b763fe1e',
    title: 'St. Bernardus Abt 12',
    description: 'Updated by Giovanni Runolfsson',
    timestamp: '12 Aug 2020, 07:24',
  },
  {
    id: '0-1c37b048',
    title: 'Double Bastard Ale',
    description: 'Updated by Edgar Turcotte',
    timestamp: '11 Aug 2020, 19:02',
  },
]

const meta = {
  title: 'UI/Templates/NotificationListTemplate',
  component: NotificationListTemplate,

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
          'Everything the notification stream has delivered so far, newest first. The',
          'list is handed to the template already mapped — one card per notification,',
          'carrying the document it is about, who changed it and when.',
          '',
          'The stream can fall over, and when it does the template says so above the',
          'list rather than in place of it: the notifications already received stay on',
          'screen and the banner offers to subscribe again. Painting the error over the',
          'list would throw away the only copy of a feed nothing else stores.',
          '',
          'Opening the page is what marks the notifications as read — the badge on the',
          'documents page resets. The template knows nothing about that; it paints what',
          'it is handed and reports the close and the retry.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    notifications: {
      control: false,
      description: [
        'The accumulated notifications, newest first. An empty list is not an error —',
        'it is the page before the first notification arrives, and says so.',
      ].join(' '),
    },
    hasError: {
      control: 'boolean',
      description: [
        'Whether the subscription gave up after its failure limit. Adds the banner',
        'above the list; the notifications already received stay put.',
      ].join(' '),
      table: { defaultValue: { summary: 'false' } },
    },
    onRetry: {
      control: false,
      description: 'Called by the banner button — the screen subscribes to the stream again.',
    },
    onClose: {
      control: false,
      description: 'Called by the close button in the header.',
    },
  },

  args: {
    notifications: NOTIFICATIONS,
    hasError: false,
    onRetry: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof NotificationListTemplate>

export default meta

type Story = StoryObj<typeof meta>

/** Three notifications, newest at the top, which is where the page opens. */
export const Default: Story = {}

/** Nothing has arrived yet. The page says so rather than sitting blank. */
export const Empty: Story = {
  args: {
    notifications: [],
  },
}

/** The stream gave up. The banner offers to reconnect; the feed stays readable. */
export const Disconnected: Story = {
  args: {
    hasError: true,
  },
}

/** The worst case: the stream died before a single notification came through. */
export const DisconnectedAndEmpty: Story = {
  args: {
    notifications: [],
    hasError: true,
  },
}

/** Long titles and names truncate rather than reflowing the card. */
export const LongContent: Story = {
  args: {
    notifications: [
      {
        id: '0-f09acc46',
        title: 'Edmund Fitzgerald Porter Barrel-Aged Reserve Collection',
        description: 'Updated by Charlie Bartholomew Fitzgerald',
        timestamp: '12 Aug 2020, 07:30',
      },
    ],
  },
}
