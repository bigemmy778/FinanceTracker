import "@/global.css";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

// Keep the splash screen up until fonts and auth state are ready
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  const fontsReady = fontsLoaded || !!fontError;
  const ready = fontsReady && isLoaded;


//   //check if fonts are loaded

  useEffect(() => {
    if (fontError) console.error("Font loading error:", fontError);
  }, [fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscriptions/[id]" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="Onboarding" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootNavigator />
    </ClerkProvider>
  );
}




// import "@/global.css";
// import { SplashScreen, Stack } from "expo-router";
// import { useFonts } from "expo-font";
// import { useEffect } from "react";

// // Keep the splash screen up until fonts are ready
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [fontsLoaded, fontError] = useFonts({
//     "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
//     "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
//     "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
//     "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
//     "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
//     "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
//   })

//   //check if fonts are loaded
//   useEffect(() => {
//     if (fontsLoaded || fontError) {
//       SplashScreen.hideAsync()
//     }
//   }, [fontsLoaded])

//   //  if (!fontsLoaded) {
//   //     return null
//   if (!fontsLoaded && !fontError) {
//     return null;
//   }

//   if (fontError) {
//     console.error("Font loading error:", fontError);
//   }


//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="(tabs)"/>
//     </Stack>
//   )
// }
