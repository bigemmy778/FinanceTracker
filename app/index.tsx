import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return <Redirect href={isSignedIn ? "/(tabs)" : "/(auth)/sign-in"} />;
}


// import { Redirect } from "expo-router";
// import { useAuth } from "@clerk/expo";

// export default function Index() {
//   const { isSignedIn } = useAuth();
//   return <Redirect href={isSignedIn ? "/(tabs)" : "/Onboarding"} />;
// }




// import { Redirect } from "expo-router";

// export default function Index() {
//   return <Redirect href="/(tabs)" />;
// }