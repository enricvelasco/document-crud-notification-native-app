import type { PropsWithChildren } from 'react'
import { type ColorValue, View } from 'react-native'
import { BottomSheet } from '@expo/ui'

import { toContentPadding } from './resources/toContentPadding'
import { toContentStyle } from './resources/toContentStyle'
import { toDismissModifiers } from './resources/toDismissModifiers'
import { BOTTOM_SHEET_NAVIGATION_WRAPPER_BACKGROUND_COLOR, BOTTOM_SHEET_NAVIGATION_WRAPPER_SCRIM_COLOR } from './styles'

export * from './models'

export type BottomSheetNavigationWrapperProps = PropsWithChildren<{
  onCloseModal: () => void
  isVisible?: boolean
  enableDropDownClose?: boolean
  enableClickOutsideClose?: boolean
  contentHeight?: number
  showDragBar?: boolean
  hasContentInset?: boolean
  backgroundColor?: ColorValue
  scrimColor?: ColorValue
}>

export const BottomSheetNavigationWrapper = ({
  onCloseModal,
  isVisible = true,
  enableDropDownClose = true,
  enableClickOutsideClose = true,
  contentHeight,
  children,
  showDragBar = true,
  hasContentInset = true,
  backgroundColor = BOTTOM_SHEET_NAVIGATION_WRAPPER_BACKGROUND_COLOR,
  scrimColor = BOTTOM_SHEET_NAVIGATION_WRAPPER_SCRIM_COLOR,
}: BottomSheetNavigationWrapperProps) => {
  return (
    <BottomSheet
      isPresented={isVisible}
      onDismiss={onCloseModal}
      showDragIndicator={showDragBar}
      containerColor={backgroundColor}
      scrimColor={scrimColor}
      contentPadding={toContentPadding(hasContentInset)}
      shouldDismissOnClickOutside={enableClickOutsideClose}
      modifiers={toDismissModifiers({ enableDropDownClose, enableClickOutsideClose })}
    >
      <View style={toContentStyle(contentHeight)}>
        {children}
      </View>
    </BottomSheet>
  )
}
