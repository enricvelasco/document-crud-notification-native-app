import { Stack } from 'expo-router'

import { Colors } from '@constants/theme'
import { AppContextProvider } from '@context'

const SHEET_SCREEN_OPTIONS = {
  presentation: 'formSheet',
  sheetGrabberVisible: true,
  contentStyle: { backgroundColor: Colors.background.default },
} as const

const DOCUMENT_DETAIL_SHEET_DETENTS = [0.5]

const DOCUMENT_NEW_SHEET_DETENTS = [0.75]

const RootLayout = () => {
  return (
    <AppContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="detail"
          options={{ ...SHEET_SCREEN_OPTIONS, sheetAllowedDetents: DOCUMENT_DETAIL_SHEET_DETENTS }}
        />
        <Stack.Screen
          name="new"
          options={{ ...SHEET_SCREEN_OPTIONS, sheetAllowedDetents: DOCUMENT_NEW_SHEET_DETENTS }}
        />
      </Stack>
    </AppContextProvider>
  )
}

export default RootLayout
