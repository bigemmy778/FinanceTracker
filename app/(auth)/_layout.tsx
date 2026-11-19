import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/expo'

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return null
  if (isSignedIn) return <Redirect href="/(tabs)" />

  return <Stack screenOptions={{ headerShown: false }} />
}


// import "@/global.css";
// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack screenOptions={{ headerShown: false }}/>;
// }
