import { Text, View } from 'react-native'

import { getBadgeLabel } from './resources/getBadgeLabel'
import { styles } from './styles'

export { BADGE_MAX_COUNT, BADGE_OVERFLOW_LABEL } from './resources/constants'

export interface BadgeProps {
  count: number
  disabled?: boolean
}

export const Badge = ({ count, disabled = false }: BadgeProps) => {
  const hasCount = count > 0

  if (!hasCount) return null

  return (
    <View style={[styles.root, disabled && styles.rootDisabled]}>
      <Text numberOfLines={1} style={styles.label}>{getBadgeLabel(count)}</Text>
    </View>
  )
}
