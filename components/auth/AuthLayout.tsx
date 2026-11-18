import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { authColors, authFonts } from '@/constants/authTheme'

type Props = { title: string; subtitle: string; children: React.ReactNode }

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: authColors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo: swap for your own <Image> if you have the asset */}
          <View className="mb-8 flex-row items-center justify-center gap-3">
            <View
              className="items-center justify-center"
              style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: authColors.accent }}
            >
              <Text style={{ fontFamily: authFonts.bold, fontSize: 28, color: '#fff' }}>F</Text>
            </View>
            <View>
              <Text style={{ fontFamily: authFonts.extrabold, fontSize: 30, color: authColors.primary }}>
                Fin Tracker
              </Text>
              <Text
                style={{
                  fontFamily: authFonts.semibold,
                  fontSize: 9,
                  letterSpacing: 2,
                  color: authColors.muted,
                }}
              >
                SUBSCRIPTIONS
              </Text>
            </View>
          </View>

          <Text
            className="text-center"
            style={{ fontFamily: authFonts.extrabold, fontSize: 28, color: authColors.primary }}
          >
            {title}
          </Text>
          <Text
            className="mb-8 mt-2 px-4 text-center"
            style={{ fontFamily: authFonts.regular, fontSize: 15, lineHeight: 22, color: authColors.muted }}
          >
            {subtitle}
          </Text>

          <View
            style={{
              backgroundColor: authColors.card,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: authColors.border,
              padding: 20,
              gap: 18,
            }}
          >
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}