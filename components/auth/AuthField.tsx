import { Text, TextInput, TextInputProps, View } from 'react-native'
import { authColors, authFonts } from '@/constants/authTheme'

type Props = TextInputProps & { label: string; error?: string }

export default function AuthField({ label, error, ...inputProps }: Props) {
  return (
    <View>
      <Text
        style={{ fontFamily: authFonts.semibold, fontSize: 13, color: authColors.primary, marginBottom: 8 }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={authColors.muted}
        style={{
          fontFamily: authFonts.medium,
          fontSize: 15,
          color: authColors.primary,
          backgroundColor: authColors.inputBg,
          borderWidth: 1,
          borderColor: error ? authColors.error : authColors.border,
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 56,
        }}
        {...inputProps}
      />
      {error ? (
        <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.error, marginTop: 6 }}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}