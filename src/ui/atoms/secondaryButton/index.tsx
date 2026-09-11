import type { ComponentType } from 'react'
import { Pressable, Text } from 'react-native'

import type { IconModel } from '@ui/atoms/icons'

import {
  SECONDARY_BUTTON_CONTENT_COLOR,
  SECONDARY_BUTTON_DISABLED_CONTENT_COLOR,
  SECONDARY_BUTTON_ICON_SIZE,
  styles,
} from './styles'

export interface SecondaryButtonProps {
  label: string
  icon?: ComponentType<IconModel>
  disabled?: boolean
  onPress: () => void
}

export const SecondaryButton = ({ label, icon, disabled = false, onPress }: SecondaryButtonProps) => {
  const Icon = icon
  const iconColor = disabled ? SECONDARY_BUTTON_DISABLED_CONTENT_COLOR : SECONDARY_BUTTON_CONTENT_COLOR

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.rootPressed, disabled && styles.rootDisabled]}
    >
      {Icon ? <Icon size={SECONDARY_BUTTON_ICON_SIZE} color={iconColor} /> : null}
      <Text numberOfLines={1} style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  )
}
