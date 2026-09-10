import { StyleSheet } from 'react-native'

import { Colors } from '@constants/theme'

export const BOTTOM_SHEET_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.25)'

export const BOTTOM_SHEET_ANIMATION_DURATION = 250

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: BOTTOM_SHEET_OVERLAY_COLOR,
  },
  overlayPressable: {
    flex: 1,
  },
  sheet: {
    width: '100%',
    height: '50%',
    backgroundColor: Colors.background.default,
  },
})
