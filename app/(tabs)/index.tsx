import "@/global.css"
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            {/* <View className="flex-1 items-center justify-center bg-background"> */}
                <Text className="text-xl font-bold text-success">
                    Hello World Felz is life in ReactNative
                </Text>

                <Link href="/Onboarding" className="mt-4 rounded bg-primary text-white p-4">Go to Onboarding</Link>
                <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">Go to Sign In</Link>
                <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">Go to Sign Up</Link>
                <Link href="/subscriptions/spotify" className="mt-4 rounded bg-primary text-white p-4">Spotify Subscription</Link>
            {/* </View> */}

        </SafeAreaView>
    );
}