import { Pressable } from 'react-native'

import type { OptionsButtonOptionModel } from '../../models'
import { getOptionsButtonItemIconColor } from './resources/getOptionsButtonItemIconColor'
import { OPTIONS_BUTTON_ITEM_ICON_SIZE, styles } from './styles'

export interface OptionsButtonItemProps {
  option: OptionsButtonOptionModel
  selected: boolean
  disabled: boolean
  divided: boolean
  onPress: () => void
}

export const OptionsButtonItem = ({
  option,
  selected,
  disabled,
  divided,
  onPress,
}: OptionsButtonItemProps) => {
  const Icon = option.icon
  const iconColor = getOptionsButtonItemIconColor({ selected, disabled })

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={option.accessibilityLabel}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        divided && styles.rootDivided,
        divided && disabled && styles.rootDividedDisabled,
        selected && styles.rootSelected,
        pressed && !selected && styles.rootPressed,
      ]}
    >
      <Icon size={OPTIONS_BUTTON_ITEM_ICON_SIZE} color={iconColor} />
    </Pressable>
  )
}
