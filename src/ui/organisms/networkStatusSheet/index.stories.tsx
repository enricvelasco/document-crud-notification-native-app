import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { NetworkStatusTypes } from '@services/network'
import { NetworkStatusSheet } from '@ui/organisms/networkStatusSheet'

const meta = {
  title: 'UI/Organisms/NetworkStatusSheet',
  component: NetworkStatusSheet,

  parameters: {
    docs: {
      description: {
        component: [
          'The notice the app paints over whatever is on screen once the device',
          'loses its connection: what the connection is now, that it has been lost,',
          'and a button to check again.',
          '',
          'It sits on `BottomSheet` without an `onDismiss`, so the overlay swallows',
          'every press instead of closing it — there is nothing to go back to while',
          'the device is offline, and the retry button is the only way forward.',
          '',
          'It holds no state and reads no service. `NetworkStatusGate` subscribes to',
          '`networkService`, decides when to mount it, and owns the retry.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    status: {
      description: 'The connection the device reports while it cannot reach the internet.',
      options: Object.values(NetworkStatusTypes),
      control: { type: 'select' },
    },
    isRetrying: {
      description: 'Whether the connection is being checked right now.',
    },
    onRetry: {
      description: 'Called when the retry button is pressed.',
    },
  },

  args: {
    status: NetworkStatusTypes.None,
    isRetrying: false,
    onRetry: () => {},
  },
} satisfies Meta<typeof NetworkStatusSheet>

export default meta

type Story = StoryObj<typeof meta>

/** The device reports no connection at all. */
export const Default: Story = {}

/** The device is on Wi-Fi, but the network behind it does not reach the internet. */
export const ConnectedWithoutInternet: Story = {
  args: {
    status: NetworkStatusTypes.Wifi,
  },
}

/** The connection is being checked, so the button reports it and stops accepting presses. */
export const Retrying: Story = {
  args: {
    isRetrying: true,
  },
}
