import type { ComponentType } from 'react'
import { Pressable, View } from 'react-native'

import { Badge } from '@ui/atoms/Badge'
import type { IconModel } from '@ui/atoms/icons'

import {
  BADGE_BUTTON_DISABLED_ICON_COLOR,
  BADGE_BUTTON_ICON_COLOR,
  BADGE_BUTTON_ICON_SIZE,
  styles,
} from './styles'

export interface BadgeButtonProps {
  icon: ComponentType<IconModel>
  count: number
  accessibilityLabel: string
  disabled?: boolean
  onPress: () => void
}

export const BadgeButton = ({
  icon,
  count,
  accessibilityLabel,
  disabled = false,
  onPress,
}: BadgeButtonProps) => {
  const Icon = icon
  const iconColor = disabled ? BADGE_BUTTON_DISABLED_ICON_COLOR : BADGE_BUTTON_ICON_COLOR

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.rootPressed, disabled && styles.rootDisabled]}
    >
      <Icon size={BADGE_BUTTON_ICON_SIZE} color={iconColor} />
      <View style={styles.badge}>
        <Badge count={count} disabled={disabled} />
      </View>
    </Pressable>
  )
}
