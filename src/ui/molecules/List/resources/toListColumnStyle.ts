import type { StyleProp, ViewStyle } from 'react-native'

import { LIST_MINIMUM_GRID_COLUMNS } from '../styles'

export interface ListColumnStyleModel {
  columns: number
  gap: number
}

export const toListColumnStyle = ({
  columns,
  gap,
}: ListColumnStyleModel): StyleProp<ViewStyle> | undefined => {
  if (columns < LIST_MINIMUM_GRID_COLUMNS) return undefined

  return { gap }
}
