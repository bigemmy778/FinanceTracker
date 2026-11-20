import "@/global.css";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { usePathname } from "expo-router";
import { posthog } from "@/lib/posthog";

// Keep the splash screen up until fonts and auth state are ready
SplashScreen.preventAutoHideAsync();

// Ties analytics events to the signed-in Clerk user and tracks screens
function Analytics() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) posthog?.identify(user.id); // id only, no email
    else posthog?.reset();
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    posthog?.screen(pathname);
  }, [pathname]);

  return null;
}


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

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
        <PostHogProvider client={posthog ?? undefined}
         autocapture={{
          captureScreens: false,
          // captureTouches: true, // optional
          // captureLifecycleEvents: true, // optional
        }}
        >
          <Analytics />
          <RootNavigator />
        </PostHogProvider>

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
