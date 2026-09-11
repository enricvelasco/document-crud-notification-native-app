import type { PropsWithChildren } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'

import { BOTTOM_SHEET_ANIMATION_DURATION, styles } from './styles'

export type BottomSheetProps = PropsWithChildren<{
  onDismiss?: () => void
}>

export const BottomSheet = ({ children, onDismiss }: BottomSheetProps) => {
  return (
    <View style={styles.root}>
      <Animated.View
        entering={FadeIn.duration(BOTTOM_SHEET_ANIMATION_DURATION)}
        exiting={FadeOut.duration(BOTTOM_SHEET_ANIMATION_DURATION)}
        style={styles.overlay}
      >
        {onDismiss ? (
          <Pressable accessibilityRole="button" style={styles.overlayPressable} onPress={onDismiss} />
        ) : null}
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(BOTTOM_SHEET_ANIMATION_DURATION)}
        exiting={SlideOutDown.duration(BOTTOM_SHEET_ANIMATION_DURATION)}
        style={styles.sheet}
      >
        {children}
      </Animated.View>
    </View>
  )
}
