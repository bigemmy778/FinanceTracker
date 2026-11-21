import { useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { authColors, authFonts } from '@/constants/authTheme'
import SubscriptionListItem from '@/components/SubscriptionListItem'
import SubscriptionSearchBar from '@/components/SubscriptionSearchBar'
import { filterSubscriptions } from '@/lib/searchSubscriptions'
import { confirmAction, showMessage } from '@/lib/confirm'
import { useSubscriptions } from '@/context/SubscriptionsContext'

const SafeAreaView = styled(RNSafeAreaView)

function RoundButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: authColors.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontFamily: authFonts.bold, fontSize: 13, color: authColors.primary }}>{label}</Text>
    </Pressable>
  )
}

export default function Subscriptions() {
  const router = useRouter()
  const { subscriptions } = useSubscriptions()
  const [items, setItems] = useState(subscriptions)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setItems(subscriptions)
  }, [subscriptions])

  const filtered = useMemo(() => filterSubscriptions(items, query), [items, query])

  const goBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(tabs)')
  }

  const cancelSubscription = (id: string, name: string) =>
    confirmAction(
      'Cancel subscription',
      `Are you sure you want to cancel ${name}?`,
      'Cancel subscription',
      () => setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s))),
    )

  // Passed as an element (not a function) so the search input keeps focus while typing
  const header = (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <RoundButton label="‹" onPress={goBack} />
        <Text style={{ fontFamily: authFonts.bold, fontSize: 18, color: authColors.primary }}>
          My Subscriptions
        </Text>
        <RoundButton label="•••" />
      </View>
      <SubscriptionSearchBar value={query} onChangeText={setQuery} />
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={header}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionListItem
            {...item}
            expanded={expandedId === item.id}
            onPress={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
            onManage={() => showMessage('Manage payment', 'Payment management is not available yet.')}
            onChange={() => showMessage('Change plan', 'Changing plans is not available yet.')}
            onCancel={() => cancelSubscription(item.id, item.name)}
          />
        )}
        extraData={expandedId}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <Text
            style={{
              textAlign: 'center',
              marginTop: 32,
              fontFamily: authFonts.medium,
              fontSize: 14,
              color: authColors.muted,
            }}
          >
            {query.trim() ? `No subscriptions match "${query.trim()}".` : 'No subscriptions yet.'}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      />
    </SafeAreaView>
  )
}