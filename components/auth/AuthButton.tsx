import { ActivityIndicator, Pressable, Text } from 'react-native'
import { authColors, authFonts } from '@/constants/authTheme'

type Props = { label: string; onPress: () => void; loading?: boolean }

export default function AuthButton({ label, onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        backgroundColor: authColors.accent,
        borderRadius: 16,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: loading ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={authColors.primary} />
      ) : (
        <Text style={{ fontFamily: authFonts.bold, fontSize: 16, color: authColors.primary }}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}