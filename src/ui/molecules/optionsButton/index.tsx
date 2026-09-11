import { View } from 'react-native'

import { OptionsButtonItem } from './components/optionsButtonItem'
import type { OptionsButtonOptionModel } from './models'
import { styles } from './styles'

export * from './models'

export interface OptionsButtonProps {
  options: readonly OptionsButtonOptionModel[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const OptionsButton = ({ options, value, onChange, disabled = false }: OptionsButtonProps) => (
  <View accessibilityRole="radiogroup" style={[styles.root, disabled && styles.rootDisabled]}>
    {options.map((option, index) => (
      <OptionsButtonItem
        key={option.value}
        option={option}
        selected={option.value === value}
        disabled={disabled}
        divided={index > 0}
        onPress={() => onChange(option.value)}
      />
    ))}
  </View>
)
