import { Image, Pressable, Text, View } from 'react-native'
import { authColors, authFonts } from '@/constants/authTheme'
import { formatCurrency } from '@/lib/utils'

const EXPANDED_BG = '#8FD3C0' // teal from the design, adjust to taste

type Props = Subscription & {
  expanded: boolean
  onPress: () => void
  onManage: () => void
  onChange: () => void
  onCancel: () => void
}

// "Visa ending in 8530" -> "•••••8530"
function maskPayment(method?: string | null) {
  const last4 = method?.match(/(\d{4})\s*$/)?.[1]
  return last4 ? `•••••${last4}` : method?.trim() || 'Not provided'
}

function PillButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: authColors.primary,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontFamily: authFonts.semibold, fontSize: 12, color: authColors.primary }}>
        {label}
      </Text>
    </Pressable>
  )
}

function DetailRow({
  label,
  value,
  action,
}: {
  label: string
  value: string
  action: React.ReactNode
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontFamily: authFonts.medium, fontSize: 13, color: authColors.muted }}>
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{ flexShrink: 1, fontFamily: authFonts.bold, fontSize: 13, color: authColors.primary }}
        >
          {value}
        </Text>
      </View>
      {action}
    </View>
  )
}

export default function SubscriptionListItem({
  name,
  icon,
  plan,
  price,
  currency,
  billing,
  paymentMethod,
  status,
  color,
  expanded,
  onPress,
  onManage,
  onChange,
  onCancel,
}: Props) {
  const cancelled = status === 'cancelled'

  // Expanded = teal; collapsed = the subscription's own color (like Home)
  const cardBg = expanded ? EXPANDED_BG : color || authColors.card
  const hasFill = expanded || !!color

  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 16,
        borderRadius: 22,
        borderWidth: hasFill ? 0 : 1,
        borderColor: authColors.border,
        backgroundColor: cardBg,
      }}
    >
      {/* Collapsed row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: hasFill ? 'rgba(255,255,255,0.6)' : 'rgba(8,17,38,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image source={icon} style={{ width: 30, height: 30 }} resizeMode="contain" />
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: authFonts.bold, fontSize: 16, color: authColors.primary }}>
            {name}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.muted }}>
            {plan?.trim() || 'Not provided'}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: authFonts.extrabold, fontSize: 16, color: authColors.primary }}>
            {formatCurrency(price, currency)}
          </Text>
          <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.muted }}>
            {billing}
          </Text>
        </View>
      </View>

      {/* Expanded details */}
      {expanded && (
        <View style={{ marginTop: 18, gap: 14 }}>
          <DetailRow
            label="Payment info:"
            value={maskPayment(paymentMethod)}
            action={<PillButton label="Manage" onPress={onManage} />}
          />
          <DetailRow
            label="Plan details:"
            value={plan?.trim() || 'Not provided'}
            action={<PillButton label="Change" onPress={onChange} />}
          />

          {cancelled ? (
            <Text
              style={{
                textAlign: 'center',
                fontFamily: authFonts.semibold,
                fontSize: 14,
                color: authColors.primary,
                paddingVertical: 14,
              }}
            >
              This subscription is cancelled
            </Text>
          ) : (
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => ({
                height: 52,
                borderRadius: 999,
                backgroundColor: authColors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontFamily: authFonts.bold, fontSize: 14, color: '#fff' }}>
                Cancel Subscription
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  )
}