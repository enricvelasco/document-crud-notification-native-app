import { Platform } from 'react-native'

const WINDOW_LEVEL_OVERLAY_PLATFORM = 'ios'

export const hasWindowLevelOverlay = (): boolean => Platform.OS === WINDOW_LEVEL_OVERLAY_PLATFORM
