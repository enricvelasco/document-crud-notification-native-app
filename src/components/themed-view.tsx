import { View, type ViewProps } from 'react-native'

import { ThemeColor, ThemeColorVariant } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor
  variant?: ThemeColorVariant
}

export const ThemedView = ({
  style,
  type = 'background',
  variant = 'default',
  ...otherProps
}: ThemedViewProps) => {
  const theme = useTheme()

  return <View style={[{ backgroundColor: theme[type][variant] }, style]} {...otherProps} />
}
