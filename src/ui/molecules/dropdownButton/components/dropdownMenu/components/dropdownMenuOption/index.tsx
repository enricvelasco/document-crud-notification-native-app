import { Pressable, Text } from 'react-native'

import type { DropdownOptionModel } from '../../../../models'
import { styles } from './styles'

export interface DropdownMenuOptionProps {
  option: DropdownOptionModel
  selected: boolean
  onPress: () => void
}

export const DropdownMenuOption = ({ option, selected, onPress }: DropdownMenuOptionProps) => (
  <Pressable
    accessibilityRole="menuitem"
    accessibilityState={{ selected }}
    onPress={onPress}
    style={({ pressed }) => [
      styles.root,
      selected && styles.rootSelected,
      pressed && !selected && styles.rootPressed,
    ]}
  >
    <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
  </Pressable>
)
