import type { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'

import { hasWindowLevelOverlay } from './resources/services'
import { styles } from './styles'

export type WindowOverlayProps = PropsWithChildren

export const WindowOverlay = ({ children }: WindowOverlayProps) => {
  const content = <View style={styles.root}>{children}</View>

  if (!hasWindowLevelOverlay()) return content

  return <FullWindowOverlay>{content}</FullWindowOverlay>
}
