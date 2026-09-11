import { Text, View } from 'react-native'

import { BADGE_ERROR_LABEL } from './resources/constants'
import { getBadgeLabel } from './resources/getBadgeLabel'
import { isBadgeVisible } from './resources/isBadgeVisible'
import { styles } from './styles'

export { BADGE_ERROR_LABEL, BADGE_MAX_COUNT, BADGE_OVERFLOW_LABEL } from './resources/constants'

export interface BadgeProps {
  count: number
  isError?: boolean
  disabled?: boolean
}

export const Badge = ({ count, isError = false, disabled = false }: BadgeProps) => {
  if (!isBadgeVisible(count, isError)) return null

  const label = isError ? BADGE_ERROR_LABEL : getBadgeLabel(count)

  return (
    <View style={[styles.root, isError && styles.rootError, disabled && styles.rootDisabled]}>
      <Text numberOfLines={1} style={styles.label}>{label}</Text>
    </View>
  )
}
