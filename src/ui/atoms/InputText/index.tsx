import { TextInput } from 'react-native'

import { useInputText } from './resources/useInputText'
import { INPUT_TEXT_DISABLED_PLACEHOLDER_COLOR, INPUT_TEXT_PLACEHOLDER_COLOR, styles } from './styles'

export interface InputTextProps {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  disabled?: boolean
  multiline?: boolean
  secureTextEntry?: boolean
  maxLength?: number
  autoFocus?: boolean
}

export const InputText = ({
  value,
  onChangeText,
  placeholder,
  disabled = false,
  multiline = false,
  secureTextEntry = false,
  maxLength,
  autoFocus = false,
}: InputTextProps) => {
  const { isFocused, handleFocus, handleBlur } = useInputText()
  const placeholderColor = disabled ? INPUT_TEXT_DISABLED_PLACEHOLDER_COLOR : INPUT_TEXT_PLACEHOLDER_COLOR

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      editable={!disabled}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      maxLength={maxLength}
      autoFocus={autoFocus}
      accessibilityState={{ disabled }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[
        styles.root,
        multiline && styles.rootMultiline,
        isFocused && styles.rootFocused,
        disabled && styles.rootDisabled,
      ]}
    />
  )
}
