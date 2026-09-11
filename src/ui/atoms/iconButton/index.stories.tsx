import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Spacing } from '@constants/theme'
import { IconButton } from '@ui/atoms/iconButton'
import { AddIcon, BellIcon, CloseIcon } from '@ui/atoms/icons'

const meta = {
  title: 'UI/Atoms/IconButton',
  component: IconButton,

  parameters: {
    docs: {
      description: {
        component: [
          'A round, icon-only button for the chrome around content — the close',
          'button in a sheet header, a back arrow, a dismiss on a card.',
          '',
          'It takes the icon as a component (`icon={CloseIcon}`) the way',
          '`PrimaryButton` does, and paints it in the colour that matches its own',
          'state, so an icon never has to be told it is inside a disabled button.',
          '',
          'There is no label, so `accessibilityLabel` is required rather than',
          'optional: without it the button is an unnamed target for a screen reader.',
          '',
          'It is deliberately not `BadgeButton` without a badge. That one is a',
          'bordered square sized for a toolbar; this one is a soft circle that sits',
          'beside a title without competing with it.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    icon: {
      control: false,
      description: 'The glyph component to paint. Rendered at a fixed size in the button\'s own colour.',
    },
    accessibilityLabel: {
      control: 'text',
      description: 'What the button is called. Required — there is no visible label to fall back on.',
    },
    disabled: {
      control: 'boolean',
      description: 'Dims the icon and stops the press.',
      table: { defaultValue: { summary: 'false' } },
    },
    onPress: {
      control: false,
      description: 'Called on tap.',
    },
  },

  args: {
    icon: CloseIcon,
    accessibilityLabel: 'Close',
    disabled: false,
    onPress: () => {},
  },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

/** The close button as a sheet header uses it. */
export const Default: Story = {}

/** Unavailable: the icon dims and the press is dropped. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/** Any icon drops in — the button only decides the size and the colour. */
export const Icons: Story = {
  render: (args) => (
    <View style={styles.row}>
      <IconButton {...args} icon={CloseIcon} accessibilityLabel="Close" />
      <IconButton {...args} icon={AddIcon} accessibilityLabel="Add" />
      <IconButton {...args} icon={BellIcon} accessibilityLabel="Notifications" />
    </View>
  ),
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
})
