import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { PrimaryButton } from '@ui/atoms/PrimaryButton'
import { BottomSheetNavigationWrapper } from '@ui/organisms/BottomSheetNavigationWrapper'

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.default,
  },
  row: {
    fontSize: 16,
    color: Colors.text.light,
  },
  stage: {
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.four,
  },
})

const SheetContent = () => (
  <View style={styles.content}>
    <Text style={styles.title}>Detalle</Text>
    <Text style={styles.row}>El contenido lo pone quien usa el componente.</Text>
  </View>
)

const meta = {
  title: 'UI/Organisms/BottomSheetNavigationWrapper',
  component: BottomSheetNavigationWrapper,

  parameters: {
    docs: {
      description: {
        component: [
          'A native bottom sheet that wraps a navigation destination. It is the whole',
          'component: it owns no state and decides nothing — the caller renders it while',
          'the route is open, passes the content as `children`, and closes the route in',
          '`onCloseModal`.',
          '',
          'It is built on `BottomSheet` from `@expo/ui`, so the sheet is the real platform',
          'one — a SwiftUI sheet on iOS, a Material 3 `ModalBottomSheet` on Android, a',
          'CSS drawer on web — instead of a `View` painted to look like one. That buys the',
          'system drag gesture, the system scrim and the system corner radius for free, and',
          'it costs the freedom to style any of them: what each platform lets you control',
          'is exactly what the props below expose.',
          '',
          '**Platform behaviour worth knowing before you rely on a prop:**',
          '',
          '- `backgroundColor` paints the scrim behind the sheet. Android honours it; iOS',
          '  and web paint their own system dimming and ignore it.',
          '- `enableDropDownClose` and `enableClickOutsideClose` are two switches on iOS',
          '  only in name. SwiftUI has a single "interactive dismissal" flag covering both',
          '  the swipe and the backdrop tap, so turning either one off disables both. On',
          '  Android only `enableClickOutsideClose` lands; the drag gesture stays on.',
          '- `contentHeight` is a fixed height in points/dp, applied to the content',
          '  rather than handed to the platform as a snap point. Material 3 sizes a',
          '  sheet to its content and drops a pixel snap point on the floor, so a sheet',
          '  asked for a height that way comes out short on Android and right',
          '  everywhere else. Sizing the content instead is the one thing all three',
          '  platforms agree on. Leave it out and the sheet hugs its children — but',
          '  then those children need an intrinsic height, because a `flex: 1` child',
          '  measures as nothing.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    onCloseModal: {
      control: false,
      description: [
        'Fired once the user has dismissed the sheet — swipe down, backdrop tap, or the',
        'Android back button. Close the route here.',
      ].join(' '),
    },
    isVisible: {
      control: 'boolean',
      description: 'Whether the sheet is presented. Flipping it to `false` plays the dismiss animation.',
      table: { defaultValue: { summary: 'true' } },
    },
    enableDropDownClose: {
      control: 'boolean',
      description: 'Whether swiping the sheet down dismisses it. No effect on Android — see the notes above.',
      table: { defaultValue: { summary: 'true' } },
    },
    enableClickOutsideClose: {
      control: 'boolean',
      description: 'Whether tapping the scrim dismisses it.',
      table: { defaultValue: { summary: 'true' } },
    },
    contentHeight: {
      control: 'number',
      description: 'Fixed sheet height. Omit it to let the sheet size itself to `children`.',
      table: { defaultValue: { summary: 'none' } },
    },
    showDragBar: {
      control: 'boolean',
      description: 'Whether the drag indicator is drawn at the top of the sheet.',
      table: { defaultValue: { summary: 'true' } },
    },
    backgroundColor: {
      control: 'color',
      description: 'The scrim colour behind the sheet. Android only.',
      table: { defaultValue: { summary: '#00000066' } },
    },
    children: {
      control: false,
      description: 'What the sheet paints. The sheet adds its own inset around it.',
    },
  },

  args: {
    onCloseModal: () => {},
    isVisible: true,
    enableDropDownClose: true,
    enableClickOutsideClose: true,
    showDragBar: true,
    backgroundColor: '#00000066',
    children: <SheetContent />,
  },
} satisfies Meta<typeof BottomSheetNavigationWrapper>

export default meta

type Story = StoryObj<typeof meta>

/** Open, sized to its content, dismissible every way the platform offers. */
export const Default: Story = {}

/** A fixed 320pt sheet instead of one that hugs its content. */
export const FixedHeight: Story = {
  args: {
    contentHeight: 320,
  },
}

/** No drag indicator — for a sheet the user is meant to leave through a button. */
export const WithoutDragBar: Story = {
  args: {
    showDragBar: false,
  },
}

/** A sheet the user cannot dismiss by gesture. On Android the drag still works. */
export const NotDismissible: Story = {
  args: {
    enableDropDownClose: false,
    enableClickOutsideClose: false,
  },
}

/** An opaque scrim, so nothing behind the sheet reads through. Android only. */
export const OpaqueScrim: Story = {
  args: {
    backgroundColor: '#000000CC',
  },
}

const NavigationExample = () => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <View style={styles.stage}>
      <PrimaryButton label="Abrir detalle" onPress={() => setIsVisible(true)} />
      <BottomSheetNavigationWrapper isVisible={isVisible} onCloseModal={() => setIsVisible(false)}>
        <SheetContent />
      </BottomSheetNavigationWrapper>
    </View>
  )
}

/** The shape a route uses: something opens the sheet, `onCloseModal` closes it again. */
export const Interactive: Story = {
  render: () => <NavigationExample />,
}
