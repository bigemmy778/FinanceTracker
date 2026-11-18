import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text } from 'react-native'
import { useClerk } from '@clerk/expo'
import { authColors, authFonts } from '@/constants/authTheme'

export default function LogoutButton() {
  const { signOut } = useClerk()
  const [loading, setLoading] = useState(false)

  const confirmLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true)
            await signOut() // route guards send the user back to the auth screens
          } catch (e) {
            console.error('Sign out failed:', e)
            setLoading(false)
          }
        },
      },
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