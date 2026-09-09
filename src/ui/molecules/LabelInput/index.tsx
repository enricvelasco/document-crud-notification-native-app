import type { ComponentType } from 'react'
import { Text, View } from 'react-native'

import { styles } from './styles'

export interface LabelInputProps<TInputProps> {
  label: string
  input: ComponentType<TInputProps>
  inputProps: TInputProps
}

export const LabelInput = <TInputProps extends { disabled?: boolean },>({
  label,
  input,
  inputProps,
}: LabelInputProps<TInputProps>) => {
  const Input = input

  return (
    <View style={styles.root}>
      <Text style={[styles.label, inputProps.disabled && styles.labelDisabled]}>{label}</Text>
      <Input {...inputProps} />
    </View>
  )
}
