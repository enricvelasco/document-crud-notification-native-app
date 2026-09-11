import type { ComponentType } from 'react'
import { Pressable } from 'react-native'

import type { IconModel } from '@ui/atoms/icons'

import {
  ICON_BUTTON_DISABLED_ICON_COLOR,
  ICON_BUTTON_ICON_COLOR,
  ICON_BUTTON_ICON_SIZE,
  styles,
} from './styles'

export interface IconButtonProps {
  icon: ComponentType<IconModel>
  accessibilityLabel: string
  disabled?: boolean
  onPress: () => void
}

export const IconButton = ({ icon, accessibilityLabel, disabled = false, onPress }: IconButtonProps) => {
  const Icon = icon
  const iconColor = disabled ? ICON_BUTTON_DISABLED_ICON_COLOR : ICON_BUTTON_ICON_COLOR

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.rootPressed, disabled && styles.rootDisabled]}
    >
      <Icon size={ICON_BUTTON_ICON_SIZE} color={iconColor} />
    </Pressable>
  )
}
