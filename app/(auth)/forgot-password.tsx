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

const GENERIC_CODE_ERROR = 'That code is invalid or has expired. Please try again.'

export default function ForgotPasswordScreen() {
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()

  const [step, setStep] = useState<ResetStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [notice, setNotice] = useState('')
  const [resetDone, setResetDone] = useState(false)

  const busy = fetchStatus === 'fetching'

  // Step 1: same result whether or not the account exists
  const sendCode = async () => {
    if (!isValidEmail(email)) return setErrors({ email: 'Enter a valid email address' })
    setErrors({})
    setNotice('')

    try {
      const { error: createError } = await signIn.create({ identifier: email.trim() })
      if (createError) {
        if (__DEV__) console.log('reset create failed:', createError)
      } else {
        const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode()
        if (sendError && __DEV__) console.log('reset sendCode failed:', sendError)
      }
    } catch (e) {
      if (__DEV__) console.log('reset request failed:', e)
    }

    setStep('code')
  }

  // Step 2: every failure shows the same message
  const verifyCode = async () => {
    if (code.trim().length < 6) return setErrors({ code: 'Enter the 6-digit code' })
    setErrors({})

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() })
      if (error) return setErrors({ code: GENERIC_CODE_ERROR })
    } catch {
      return setErrors({ code: GENERIC_CODE_ERROR })
    }

    setStep('password')
  }

  // Signs the user in after the password has changed (retryable on its own)
  const activate = async () => {
    const { error } = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return
        const url = decorateUrl('/(tabs)')
        if (url.startsWith('http')) window.location.href = url
        else router.replace(url as Href)
      },
    })
    if (error) {
      setErrors({
        form: "Your password was updated, but we couldn't sign you in. Tap Try again, or sign in with your new password.",
      })
    }
  }

  // Step 3
  const submitPassword = async () => {
    if (resetDone) return activate() // never resubmit the password change

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

    setResetDone(true)
    if (signIn.status === 'complete') await activate()
    else setErrors({ form: 'Extra verification is required that this app does not support yet.' })
  }

  const resend = async () => {
    try {
      await signIn.resetPasswordEmailCode.sendCode()
    } catch {}
    setErrors({})
    setNotice('If an account exists, a new code is on its way.')
  }

  const titles: Record<ResetStep, [string, string]> = {
    email: ['Forgot password?', "Enter your email and we'll send you a reset code"],
    code: ['Check your email', `If an account exists for ${email.trim()}, we sent a reset code.`],
    password: ['Set a new password', 'Choose a strong password you have not used before'],
  }

  const onSubmit = { email: sendCode, code: verifyCode, password: submitPassword }[step]
  const label = resetDone
    ? 'Try again'
    : { email: 'Send Reset Code', code: 'Verify Code', password: 'Update Password' }[step]

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

      {notice ? (
        <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.muted }}>
          {notice}
        </Text>
      ) : null}

      <AuthButton label={label} onPress={onSubmit} loading={busy} />

      {step === 'code' && (
        <Pressable onPress={resend} style={{ alignItems: 'center' }}>
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