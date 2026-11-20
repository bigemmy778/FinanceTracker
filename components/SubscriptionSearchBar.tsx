import { Pressable, Text, TextInput, View } from 'react-native'
import { authColors, authFonts } from '@/constants/authTheme'

type Props = {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
}

export default function SubscriptionSearchBar({ value, onChangeText, onSubmit }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 0.2,
        borderColor: "",
        backgroundColor: "",
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Search subscriptions"
        placeholderTextColor={authColors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={{
          flex: 1,
          fontFamily: authFonts.medium,
          fontSize: 15,
      
          color: "",
        }}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10}>
          <Text style={{ fontFamily: authFonts.bold, fontSize: 18, color: authColors.muted }}>×</Text>
        </Pressable>
      )}
    </View>
  )
}