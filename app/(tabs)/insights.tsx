import { useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { useSubscriptions } from '@/context/SubscriptionsContext'
import { authColors, authFonts } from '@/constants/authTheme'
import { formatCurrency } from '@/lib/utils'

const SafeAreaView = styled(RNSafeAreaView)

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CHART_H = 140
const TOOLTIP_H = 30

const PANEL_BG = 'rgba(8,17,38,0.05)'


// Next renewal on or after today, stepping forward by the billing period
function nextRenewal(s: Subscription) {
  const today = dayjs().startOf('day')
  const unit = s.billing?.toLowerCase() === 'yearly' ? 'year' : 'month'
  let next = dayjs(s.renewalDate)
  if (next.isBefore(today)) {
    next = next.add(Math.ceil(today.diff(next, unit, true)), unit)
    if (next.isBefore(today)) next = next.add(1, unit)
  }
  return next
}

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

function SectionHeader({ title, onViewAll }: { title: string; onViewAll: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}
    >
      <Text style={{ fontFamily: authFonts.bold, fontSize: 18, color: authColors.primary }}>{title}</Text>
      <Pressable
        onPress={onViewAll}
        style={({ pressed }) => ({
          paddingHorizontal: 16,
          paddingVertical: 7,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: authColors.border,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontFamily: authFonts.semibold, fontSize: 12, color: authColors.primary }}>
          View all
        </Text>
      </Pressable>
    </View>
  )
}

function HistoryItem({ item }: { item: Subscription }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 22,
        backgroundColor: item.color || authColors.card,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image source={item.icon} style={{ width: 28, height: 28 }} resizeMode="contain" />
      </View>

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: authFonts.bold, fontSize: 16, color: authColors.primary }}>
          {item.name}
        </Text>
        <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.muted }}>
          {dayjs(item.renewalDate).format('MMMM D, HH:mm')}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: authFonts.extrabold, fontSize: 16, color: authColors.primary }}>
          {formatCurrency(item.price, item.currency)}
        </Text>
        <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.muted }}>
          {item.billing?.toLowerCase() === 'yearly' ? 'per year' : 'per month'}
        </Text>
      </View>
    </View>
  )
}

export default function Insights() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)

  const { subscriptions } = useSubscriptions()

  const { weekly, niceMax, ticks, peakIdx, monthlyTotal, history } = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'active')

    // Only renewals in the next 7 days, grouped by weekday (Mon..Sun)
    const today = dayjs().startOf('day')
    const windowEnd = today.add(7, 'day')

    const weekly = DAYS.map(() => 0)
    active.forEach((s) => {
      const next = nextRenewal(s)
      if (next.isBefore(today) || !next.isBefore(windowEnd)) return
      weekly[(next.day() + 6) % 7] += s.price
    })

    const max = Math.max(...weekly, 0)
    const niceMax = Math.max(20, Math.ceil(max / 20) * 20)
    const ticks = [4, 3, 2, 1, 0].map((i) => Math.round((niceMax * i) / 4))
    const peakIdx = max > 0 ? weekly.indexOf(max) : -1

    // Yearly plans count as 1/12 of their price per month
    const monthlyTotal = active.reduce(
      (sum, s) => sum + (s.billing?.toLowerCase() === 'yearly' ? s.price / 12 : s.price),
      0,
    )

    const history = [...subscriptions].sort(
      (a, b) => dayjs(b.renewalDate).valueOf() - dayjs(a.renewalDate).valueOf(),
    )

    return { weekly, niceMax, ticks, peakIdx, monthlyTotal, history }
  }, [subscriptions])

  const activeIdx = selected ?? peakIdx

  const goBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(tabs)')
  }
  const viewAll = () => router.push('/(tabs)/subscriptions')

  return (
    <SafeAreaView className="flex-1 bg-background p-5 ">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <RoundButton label="‹" onPress={goBack} />
          <Text style={{ fontFamily: authFonts.bold, fontSize: 18, color: authColors.primary }}>
            Monthly Insights
          </Text>
          <RoundButton label="•••" />
        </View>

        {/* Upcoming chart */}
        <SectionHeader title="Upcoming" onViewAll={viewAll} />
        <View style={{ backgroundColor: PANEL_BG, borderRadius: 24, padding: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row' }}>
            {/* Y axis labels */}
            <View
              style={{
                height: CHART_H,
                marginTop: TOOLTIP_H,
                justifyContent: 'space-between',
                paddingRight: 10,
              }}
            >
              {ticks.map((t) => (
                <Text
                  key={t}
                  style={{ fontFamily: authFonts.medium, fontSize: 11, color: authColors.muted }}
                >
                  {t}
                </Text>
              ))}
            </View>

            {/* Bars */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', height: CHART_H + TOOLTIP_H }}>
                {weekly.map((value, i) => {
                  const barH = value > 0 ? Math.max(8, (value / niceMax) * CHART_H) : 6
                  const isActive = i === activeIdx && value > 0
                  return (
                    <Pressable
                      key={DAYS[i]}
                      onPress={() => setSelected(i)}
                      style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      {isActive && (
                        <View
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            marginBottom: 6,
                          }}
                        >
                          <Text
                            style={{ fontFamily: authFonts.bold, fontSize: 11, color: authColors.accent }}
                          >
                            {formatCurrency(value, 'USD')}
                          </Text>
                        </View>
                      )}
                      <View
                        style={{
                          width: 12,
                          height: barH,
                          borderRadius: 6,
                          backgroundColor: isActive ? authColors.accent : authColors.primary,
                          opacity: value > 0 ? 1 : 0.15,
                        }}
                      />
                    </Pressable>
                  )
                })}
              </View>

              {/* Day labels */}
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                {DAYS.map((d) => (
                  <Text
                    key={d}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontFamily: authFonts.medium,
                      fontSize: 11,
                      color: authColors.muted,
                    }}
                  >
                    {d}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Expenses */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 18,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: authColors.border,
            backgroundColor: authColors.card,
            marginBottom: 26,
          }}
        >
          <View>
            <Text style={{ fontFamily: authFonts.bold, fontSize: 16, color: authColors.primary }}>
              Expenses
            </Text>
            <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.muted }}>
              {dayjs().format('MMMM YYYY')}
            </Text>
          </View>
          <Text style={{ fontFamily: authFonts.extrabold, fontSize: 20, color: authColors.primary }}>
            -{formatCurrency(monthlyTotal, 'USD')}
          </Text>
        </View>

        {/* History */}
        <SectionHeader title="History" onViewAll={viewAll} />
        <View style={{ gap: 14 }}>
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}