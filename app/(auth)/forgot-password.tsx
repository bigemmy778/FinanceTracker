import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import { type Href, Link, useRouter } from 'expo-router'
import { useSignIn } from '@clerk/expo'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthField from '@/components/auth/AuthField'
import AuthButton from '@/components/auth/AuthButton'
import { authColors, authFonts } from '@/constants/authTheme'
import { isValidEmail, parseClerkError } from '@/lib/clerk-errors'
import type { AuthFormErrors, ResetStep } from '@/types/auth'

export default function ForgotPasswordScreen() {
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()

  const [step, setStep] = useState<ResetStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<AuthFormErrors>({})

  const busy = fetchStatus === 'fetching'

  const sendCode = async () => {
    if (!isValidEmail(email)) return setErrors({ email: 'Enter a valid email address' })
    setErrors({})

    const { error: createError } = await signIn.create({ identifier: email.trim() })
    if (createError) return setErrors({ email: parseClerkError(createError).message })

    const { error } = await signIn.resetPasswordEmailCode.sendCode()
    if (error) return setErrors({ email: parseClerkError(error).message })

    setStep('code')
  }

  const verifyCode = async () => {
    if (code.trim().length < 6) return setErrors({ code: 'Enter the 6-digit code' })
    setErrors({})

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() })
    if (error) return setErrors({ code: parseClerkError(error).message })

    setStep('password')
  }

  const submitPassword = async () => {
    const next: AuthFormErrors = {}
    if (password.length < 8) next.password = 'Use at least 8 characters'
    if (confirm !== password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length) return

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    })
    if (error) return setErrors({ password: parseClerkError(error).message })

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl('/(tabs)')
          if (url.startsWith('http')) window.location.href = url
          else router.replace(url as Href)
        },
      })
    } else {
      setErrors({ form: 'Extra verification is required that this app does not support yet.' })
    }
  }

  const titles: Record<ResetStep, [string, string]> = {
    email: ['Forgot password?', "Enter your email and we'll send you a reset code"],
    code: ['Check your email', `Enter the code we sent to ${email.trim()}`],
    password: ['Set a new password', 'Choose a strong password you have not used before'],
  }

  const onSubmit = { email: sendCode, code: verifyCode, password: submitPassword }[step]
  const label = { email: 'Send Reset Code', code: 'Verify Code', password: 'Update Password' }[step]

  return (
    <AuthLayout title={titles[step][0]} subtitle={titles[step][1]}>
      {step === 'email' && (
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
      )}

      {step === 'code' && (
        <AuthField
          label="Reset Code"
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="off"
          textContentType="none"
          autoCorrect={false}
          value={code}
          onChangeText={setCode}
          error={errors.code}
        />
      )}

      {step === 'password' && (
        <>
          <AuthField
            label="New Password"
            placeholder="Enter a new password"
            secureTextEntry
            autoComplete="off"
            textContentType="oneTimeCode"
            autoCorrect={false}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          <AuthField
            label="Confirm Password"
            placeholder="Repeat your new password"
            secureTextEntry
            autoComplete="off"
            textContentType="oneTimeCode"
            autoCorrect={false}
            autoCapitalize="none"
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirmPassword}
          />
        </>
      )}

      {errors.form ? (
        <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.error }}>
          {errors.form}
        </Text>
      ) : null}

      <AuthButton label={label} onPress={onSubmit} loading={busy} />

      {step === 'code' && (
        <Pressable
          onPress={async () => {
            const res = await signIn.resetPasswordEmailCode.sendCode()
            if (res?.error) setErrors({ code: parseClerkError(res.error).message })
          }}
          style={{ alignItems: 'center' }}
        >
          <Text style={{ fontFamily: authFonts.medium, fontSize: 13, color: authColors.muted }}>
            Didn't get a code? Send a new one
          </Text>
        </Pressable>
      )}

      <Link
        href="/(auth)/sign-in"
        style={{
          textAlign: 'center',
          fontFamily: authFonts.semibold,
          fontSize: 13,
          color: authColors.accent,
        }}
      >
        Back to Sign In
      </Link>
    </AuthLayout>
  )
}
