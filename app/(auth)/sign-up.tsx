import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { type Href, Link, useRouter } from 'expo-router'
import { useSignUp } from '@clerk/expo'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthField from '@/components/auth/AuthField'
import AuthButton from '@/components/auth/AuthButton'
import { authColors, authFonts } from '@/constants/authTheme'
import { isValidEmail, parseClerkError } from '@/lib/clerk-errors'
import type { AuthFormErrors, VerificationStep } from '@/types/auth'

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp()
  const router = useRouter()

  const [step, setStep] = useState<VerificationStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState<AuthFormErrors>({})

  const busy = fetchStatus === 'fetching'

  // Which extra fields Clerk is asking for (read fresh on every render)
  const missing: string[] = (signUp as any)?.missingFields ?? []
  const noneListed = missing.length === 0
  const needFirst = missing.includes('first_name')
  const needLast = missing.includes('last_name')
  const needUsername = missing.includes('username')
  const unsupported = missing.filter(
    (f) => !['first_name', 'last_name', 'username', 'email_address', 'password'].includes(f),
  )

  const fail = (error: unknown) => {
    const { field, message } = parseClerkError(error)
    setErrors({ [field]: message })
  }

  const completeSignUp = async () => {
    const res = await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return
        const url = decorateUrl('/(tabs)')
        if (url.startsWith('http')) window.location.href = url
        else router.replace(url as Href)
      },
    })
    return res?.error
  }

  const handleSignUp = async () => {
    const next: AuthFormErrors = {}
    if (!isValidEmail(email)) next.email = 'Enter a valid email address'
    if (password.length < 8) next.password = 'Use at least 8 characters'
    setErrors(next)
    if (Object.keys(next).length) return

    const { error } = await signUp.password({ emailAddress: email.trim(), password })
    if (error) return fail(error)

    const sent = await signUp.verifications.sendEmailCode()
    if (sent?.error) return fail(sent.error)

    setStep('verify')
  }

  const handleVerify = async () => {
    if (code.trim().length < 6) return setErrors({ code: 'Enter the 6-digit code' })
    setErrors({})

    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() })
    if (error) return fail(error)

    // Try to finish. If Clerk still needs details, ask for them.
    const finalizeError = await completeSignUp()
    if (finalizeError) {
      console.log('MISSING FIELDS:', (signUp as any)?.missingFields)
      setStep('details')
    }
  }

  const handleDetails = async () => {
    const next: AuthFormErrors = {}
    if (needFirst && !firstName.trim()) next.firstName = 'Enter your first name'
    if (needLast && !lastName.trim()) next.lastName = 'Enter your last name'
    if (needUsername && !username.trim()) next.username = 'Choose a username'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload: Record<string, string> = {}
    if (firstName.trim()) payload.firstName = firstName.trim()
    if (lastName.trim()) payload.lastName = lastName.trim()
    if (username.trim()) payload.username = username.trim()

    const { error } = await (signUp as any).update(payload)
    if (error) return fail(error)

    const finalizeError = await completeSignUp()
    if (finalizeError) fail(finalizeError)
  }

  const resend = async () => {
    const res = await signUp.verifications.sendEmailCode()
    if (res?.error) fail(res.error)
  }

  const titles: Record<VerificationStep, [string, string]> = {
    credentials: ['Create your account', 'Start tracking your subscriptions and never miss a payment'],
    verify: ['Verify your email', `We sent a 6-digit code to ${email.trim()}`],
    details: ['Complete your profile', 'Just a few more details to finish setting up'],
  }

  return (
    <AuthLayout title={titles[step][0]} subtitle={titles[step][1]}>
      {step === 'credentials' && (
        <>
          <AuthField
            label="Email Address"
            placeholder="Enter your email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <AuthField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
        </>
      )}

      {step === 'verify' && (
        <AuthField
          label="Verification Code"
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
          value={code}
          onChangeText={setCode}
          error={errors.code}
        />
      )}

      {step === 'details' && (
        <>
          {(needFirst || noneListed) && (
            <AuthField
              label="First Name"
              placeholder="Enter your first name"
              autoCapitalize="words"
              autoComplete="given-name"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.firstName}
            />
          )}
          {(needLast || noneListed) && (
            <AuthField
              label="Last Name"
              placeholder="Enter your last name"
              autoCapitalize="words"
              autoComplete="family-name"
              value={lastName}
              onChangeText={setLastName}
              error={errors.lastName}
            />
          )}
          {(needUsername || noneListed) && (
            <AuthField
              label="Username"
              placeholder="Choose a username"
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
            />
          )}
          {unsupported.length > 0 && (
            <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.error }}>
              Clerk also requires: {unsupported.join(', ')}. Turn these off in the Clerk Dashboard
              (User & authentication) or tell your developer to add inputs for them.
            </Text>
          )}
        </>
      )}

      {errors.form ? (
        <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.error }}>
          {errors.form}
        </Text>
      ) : null}

      <AuthButton
        label={
          step === 'credentials' ? 'Create Account' : step === 'verify' ? 'Verify & Continue' : 'Finish'
        }
        onPress={step === 'credentials' ? handleSignUp : step === 'verify' ? handleVerify : handleDetails}
        loading={busy}
      />

      {step === 'verify' && (
        <Pressable onPress={resend} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: authFonts.medium, fontSize: 13, color: authColors.muted }}>
            Didn't get a code? Send a new one
          </Text>
        </Pressable>
      )}

      {step === 'credentials' && (
        <View className="flex-row justify-center gap-1">
          <Text style={{ fontFamily: authFonts.regular, fontSize: 13, color: authColors.muted }}>
            Already have an account?
          </Text>
          <Link
            href="/(auth)/sign-in"
            style={{ fontFamily: authFonts.semibold, fontSize: 13, color: authColors.accent }}
          >
            Sign In
          </Link>
          
        </View>
      )}
    </AuthLayout>
  )
}