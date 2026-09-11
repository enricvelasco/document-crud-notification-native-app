import type { BottomSheetProps } from '@expo/ui'

const FULL_BLEED_CONTENT_PADDING = 0

export const toContentPadding = (
  hasContentInset: boolean,
): BottomSheetProps['contentPadding'] => {
  if (hasContentInset) return undefined

  return FULL_BLEED_CONTENT_PADDING
}
