import { useState } from 'react'
import { ActivityIndicator, Alert, Platform, Pressable, Text } from 'react-native'
import { useClerk } from '@clerk/expo'
import { usePostHog } from 'posthog-react-native'
import { authColors, authFonts } from '@/constants/authTheme'
import { posthogLogger } from '@/lib/posthog'

export default function LogoutButton() {
  const { signOut } = useClerk()
  const posthog = usePostHog()
  const [loading, setLoading] = useState(false)

  const doSignOut = async () => {
    try {
      setLoading(true)
      await signOut() // route guards send the user back to the auth screens
      posthog?.capture('user_signed_out')
      posthogLogger.info('user signed out', {
        action: 'sign_out',
        outcome: 'completed',
      })
    } catch (e) {
      console.error('Sign out failed:', e)
      setLoading(false)
    }
  }

  const confirmLogout = () => {
    // Alert.alert shows nothing on web, so use the browser's confirm there
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) doSignOut()
      return
    }
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: doSignOut },
    ])
  }

  return (
    <Pressable
      onPress={confirmLogout}
      disabled={loading}
      style={({ pressed }) => ({
        height: 56,
        borderRadius: 16,
        backgroundColor: authColors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: loading ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={authColors.primary} />
      ) : (
        <Text style={{ fontFamily: authFonts.bold, fontSize: 16, color: authColors.primary }}>
          Sign Out
        </Text>
      )}
    </Pressable>
  )
}