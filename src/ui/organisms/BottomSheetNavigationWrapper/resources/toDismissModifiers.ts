import type { BottomSheetProps } from '@expo/ui'

import type { DismissGesturesModel } from '../models'
import { getInteractiveDismissDisabledModifier } from './getInteractiveDismissDisabledModifier'

const isEveryDismissGestureEnabled = ({
  enableDropDownClose,
  enableClickOutsideClose,
}: DismissGesturesModel) => enableDropDownClose && enableClickOutsideClose

export const toDismissModifiers = (gestures: DismissGesturesModel): BottomSheetProps['modifiers'] => {
  if (isEveryDismissGestureEnabled(gestures)) return undefined

  const modifier = getInteractiveDismissDisabledModifier()
  if (!modifier) return undefined

  return [modifier]
}
