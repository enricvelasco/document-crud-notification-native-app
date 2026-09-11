import { Stack } from 'expo-router'

import { AppContextProvider } from '@context'

const RootLayout = () => {
  return (
    <AppContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="detail"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            gestureEnabled: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </AppContextProvider>
  )
}

export default RootLayout
