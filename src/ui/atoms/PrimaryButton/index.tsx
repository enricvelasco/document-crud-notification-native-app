import type { ComponentType } from 'react'
import { Pressable, Text } from 'react-native'

import type { IconModel } from '@ui/atoms/icons'

import {
  PRIMARY_BUTTON_CONTENT_COLOR,
  PRIMARY_BUTTON_DISABLED_CONTENT_COLOR,
  PRIMARY_BUTTON_ICON_SIZE,
  styles,
} from './styles'

export interface PrimaryButtonProps {
  label: string
  icon?: ComponentType<IconModel>
  disabled?: boolean
  onPress: () => void
}

export const PrimaryButton = ({ label, icon, disabled = false, onPress }: PrimaryButtonProps) => {
  const Icon = icon
  const iconColor = disabled ? PRIMARY_BUTTON_DISABLED_CONTENT_COLOR : PRIMARY_BUTTON_CONTENT_COLOR

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.rootPressed, disabled && styles.rootDisabled]}
    >
      {Icon ? <Icon size={PRIMARY_BUTTON_ICON_SIZE} color={iconColor} /> : null}
      <Text numberOfLines={1} style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  )
}
