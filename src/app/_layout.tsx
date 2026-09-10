import { Stack } from 'expo-router'

const RootLayout = () => {
  return (
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
  )
}

export default RootLayout
