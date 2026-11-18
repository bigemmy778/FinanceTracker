import { Image, Text, View } from 'react-native'
import { useUser } from '@clerk/expo'
import { authColors, authFonts } from '@/constants/authTheme'
import { getDisplayName } from '@/lib/user'

export default function UserAvatar({ size = 44 }: { size?: number }) {
  const { user } = useUser()
  if (!user) return null

  // hasImage is true only when the user has a real photo (upload or social login)
  if (user.hasImage) {
    return (
      <Image
        source={{ uri: user.imageUrl }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E5E5E5' }}
      />
    )
  }

  const initial = getDisplayName(user).charAt(0).toUpperCase()

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: authColors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: authFonts.bold, fontSize: size * 0.42, color: '#fff' }}>
        {initial}
      </Text>
    </View>
  )
}