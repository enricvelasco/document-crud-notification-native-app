import type { StyleProp, ViewStyle } from 'react-native'

import { styles } from '../styles'

export const toListContentStyle = (gap: number): StyleProp<ViewStyle> => [styles.content, { gap }]
