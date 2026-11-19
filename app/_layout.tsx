import "@/global.css";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

// Keep the splash screen up until fonts and auth state are ready
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const identifiedUserId = useRef<string | undefined>(undefined);

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

  useEffect(() => {
    if (!isUserLoaded || !posthog) return;

    if (!user) {
      identifiedUserId.current = undefined;
      return;
    }

    if (identifiedUserId.current === user.id) return;

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName;
    const username = user.username;

    posthog.identify(user.id, {
      $set: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
        ...(username ? { username } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isUserLoaded, user]);

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
  const navigator = <RootNavigator />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>{navigator}</PostHogProvider>
      ) : (
        navigator
      )}
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
