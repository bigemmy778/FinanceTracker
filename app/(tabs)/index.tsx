import "@/global.css"
import { Text, View, Image, FlatList } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { styled } from "nativewind";
import UserAvatar from '@/components/UserAvatar'
import { getDisplayName } from '@/lib/user'
import { HOME_USER, HOME_BALANCE, UPCOMING_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/lib/SubscriptionCard";
import { useUser } from '@clerk/expo'
import { usePostHog } from 'posthog-react-native'

const SafeAreaView = styled(RNSafeAreaView)

export default function Home() {
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
    const { isLoaded, user } = useUser()
    const posthog = usePostHog()

    const handleSubscriptionPress = (subscriptionId: string) => {
        const action = expandedSubscriptionId === subscriptionId ? 'collapsed' : 'expanded'
        posthog?.capture('subscription_details_toggled', { action })
        setExpandedSubscriptionId(action === 'expanded' ? subscriptionId : null)
    }

    if (!isLoaded) return null
    return (
        <SafeAreaView className="flex-1 bg-background p-5">

            <FlatList
                ListHeaderComponent={() => (
                    <>
                        {/* Avatar or Profile */}
                        <View className="home-header">
                            <View className="home-user">
                                {/* <Image source={images.avatar} className="home-avatar" /> */}
                                <UserAvatar size={44} />
                                <Text className="home-user-name">{getDisplayName(user)}</Text>
                            </View>

                            <Image source={icons.add} style={{}}
                                className="home-add-icon" />
                        </View>

                        {/* Home Balance */}
                        <View className="home-balance-card">
                            <Text className="home-balance-label">Total Balance</Text>
                            <View className="home-balance-row">
                                <Text className="home-balance-amount">
                                    {formatCurrency(HOME_BALANCE.amount)}
                                </Text>

                                <Text className="home-balance-date">
                                    {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                                </Text>
                                {/* <Image source={icons.eye} className="home-eye-icon" /> */}
                            </View>

                        </View>

                        {/* Upcoming Container */}
                        <View className="mb-3">
                            <ListHeading title="Upcoming" />

                            <FlatList
                                data={UPCOMING_SUBSCRIPTIONS}
                                renderItem={({ item }) => (<UpcomingSubscriptionCard {...item} />)}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                            />

                        </View>

                        <ListHeading title="All Subscriptions" />
                    </>
                )}
                data={HOME_SUBSCRIPTIONS}
                keyExtractor={(items) => items.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item} expanded={expandedSubscriptionId === item.id}
                        onPress={() => handleSubscriptionPress(item.id)}
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">
                    No subscription yet.
                </Text>}
                contentContainerClassName="pb-30"
            />
        </SafeAreaView>
    );
}


