import { Stack } from 'expo-router'

import { AppContextProvider } from '@context'

const BOTTOM_SHEET_SCREEN_OPTIONS = {
  presentation: 'transparentModal',
  animation: 'fade',
  gestureEnabled: false,
  contentStyle: { backgroundColor: 'transparent' },
} as const

const RootLayout = () => {
  return (
    <AppContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="detail" options={BOTTOM_SHEET_SCREEN_OPTIONS} />
        <Stack.Screen name="new" options={BOTTOM_SHEET_SCREEN_OPTIONS} />
      </Stack>
    </AppContextProvider>
  )
}

export default RootLayout
