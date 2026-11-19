import React from 'react'
import { Text, View } from 'react-native'
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/expo'
import UserAvatar from '@/components/UserAvatar'
import LogoutButton from '@/components/auth/LogoutButton'
import { getDisplayName } from '@/lib/user'
import { authColors, authFonts } from '@/constants/authTheme'

const SafeAreaView = styled(RNSafeAreaView)

const cardStyle = {
  backgroundColor: authColors.card,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: authColors.border,
  padding: 20,
} as const

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-6">
      <Text style={{ fontFamily: authFonts.medium, fontSize: 13, color: authColors.muted }}>
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          textAlign: 'right',
          fontFamily: authFonts.semibold,
          fontSize: 13,
          color: authColors.primary,
        }}
      >
        {value}
      </Text>
    </View>
  )
}

const Settings = () => {
  const { isLoaded, user } = useUser()

  if (!isLoaded) return null

  // 19.11.2026 style
  const joined = user?.createdAt
    ? user.createdAt.toLocaleDateString('en-GB').replace(/\//g, '.')
    : '-'

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text style={{ fontFamily: authFonts.extrabold, fontSize: 28, color: authColors.primary }}>
        Settings
      </Text>

      {/* Profile card */}

      <View style={[cardStyle, { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
        <UserAvatar size={64} />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ fontFamily: authFonts.bold, fontSize: 18, color: authColors.primary }}
          >
            {getDisplayName(user)}
          </Text>
          <Text
            numberOfLines={1}
            style={{ fontFamily: authFonts.regular, fontSize: 13, color: authColors.muted }}
          >
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      {/* Account card */}
      <View style={[cardStyle, { marginTop: 20, gap: 16 }]}>
        <Text style={{ fontFamily: authFonts.bold, fontSize: 15, color: authColors.primary }}>
          Account
        </Text>
        <InfoRow label="Account ID" value={user?.id ?? '-'} />
        <InfoRow label="Joined" value={joined} />
      </View>

      {/* Sign out */}
      <View style={{ marginTop: 20 }}>
        <LogoutButton />
      </View>
    </SafeAreaView>
  )
}

export default Settings