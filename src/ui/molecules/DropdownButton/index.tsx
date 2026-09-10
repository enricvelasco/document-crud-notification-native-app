import type { ComponentType } from 'react'
import { Pressable, Text, View } from 'react-native'

import type { IconModel } from '@ui/atoms/icons'
import { ChevronDownIcon } from '@ui/atoms/icons'

import { DropdownMenu } from './components/DropdownMenu'
import type { DropdownOptionModel } from './models'
import { useDropdownButton } from './resources/useDropdownButton'
import {
  DROPDOWN_BUTTON_CONTENT_COLOR,
  DROPDOWN_BUTTON_DISABLED_CONTENT_COLOR,
  DROPDOWN_BUTTON_ICON_SIZE,
  styles,
} from './styles'

export * from './models'

export interface DropdownButtonProps {
  label: string
  options: readonly DropdownOptionModel[]
  onChange: (value: string) => void
  value?: string
  icon?: ComponentType<IconModel>
  disabled?: boolean
}

export const DropdownButton = ({
  label,
  options,
  onChange,
  value,
  icon,
  disabled = false,
}: DropdownButtonProps) => {
  const { anchorRef, anchor, isOpen, openMenu, closeMenu } = useDropdownButton()
  const Icon = icon
  const contentColor = disabled ? DROPDOWN_BUTTON_DISABLED_CONTENT_COLOR : DROPDOWN_BUTTON_CONTENT_COLOR

  const handleSelect = (selected: string) => {
    closeMenu()
    onChange(selected)
  }

  return (
    <View ref={anchorRef} collapsable={false} style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: isOpen }}
        disabled={disabled}
        onPress={openMenu}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
      >
        <View style={styles.labelSection}>
          {Icon ? <Icon size={DROPDOWN_BUTTON_ICON_SIZE} color={contentColor} /> : null}
          <Text numberOfLines={1} style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
        </View>
        <View style={[styles.divider, disabled && styles.dividerDisabled]} />
        <View style={styles.iconSection}>
          <ChevronDownIcon size={DROPDOWN_BUTTON_ICON_SIZE} color={contentColor} />
        </View>
      </Pressable>
      <DropdownMenu
        visible={isOpen}
        anchor={anchor}
        options={options}
        value={value}
        onSelect={handleSelect}
        onDismiss={closeMenu}
      />
    </View>
  )
}
