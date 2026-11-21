import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { type Href, Link, useRouter } from 'expo-router'
import { useSignIn } from '@clerk/expo'
import { usePostHog } from 'posthog-react-native'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthField from '@/components/auth/AuthField'
import AuthButton from '@/components/auth/AuthButton'
import { authColors, authFonts } from '@/constants/authTheme'
import { isValidEmail, parseClerkError } from '@/lib/clerk-errors'
import type { AuthFormErrors } from '@/types/auth'

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()
  const posthog = usePostHog()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [needsCode, setNeedsCode] = useState(false)
  const [verified, setVerified] = useState(false) // credentials/code accepted, only activation left
  const [errors, setErrors] = useState<AuthFormErrors>({})

  const busy = fetchStatus === 'fetching'

  // Editing a field starts a fresh attempt
  const edit = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    if (verified) setVerified(false)
  }

  // Activates the session; safe to retry without repeating verification
  const finish = async () => {
    setVerified(true)
    setErrors({})

    const { error } = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return
        const url = decorateUrl('/(tabs)')
        if (url.startsWith('http')) window.location.href = url
        else router.replace(url as Href)
      },
    })
    if (error) setErrors({ form: parseClerkError(error).message })
    else posthog?.capture('user_signed_in')
  }

  const handleSignIn = async () => {
    const next: AuthFormErrors = {}
    if (!isValidEmail(email)) next.email = 'Enter a valid email address'
    if (!password) next.password = 'Enter your password'
    setErrors(next)
    if (Object.keys(next).length) return

    const { error } = await signIn.password({ emailAddress: email.trim(), password })
    if (error) {
      const { field, message } = parseClerkError(error)
      return setErrors({ [field]: message })
    }

    if (signIn.status === 'complete') return finish()

    // New device: Clerk asks for an email code
    if (signIn.status === 'needs_client_trust') {
      const factor = signIn.supportedSecondFactors?.find((f) => f.strategy === 'email_code')
      if (factor) {
        const sent = await signIn.mfa.sendEmailCode()
        if (sent?.error) return setErrors({ form: parseClerkError(sent.error).message })
        setCode('')
        return setNeedsCode(true)
      }
    }

    setErrors({ form: 'Extra verification is required that this app does not support yet.' })
  }

  const handleVerify = async () => {
    if (code.trim().length < 6) return setErrors({ code: 'Enter the 6-digit code' })
    setErrors({})

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() })
    if (error) return setErrors({ code: parseClerkError(error).message })

    if (signIn.status === 'complete') return finish()
    setErrors({ code: 'That code is not valid. Please try again.' })
  }

  const resend = async () => {
    const res = await signIn.mfa.sendEmailCode()
    if (res?.error) setErrors({ form: parseClerkError(res.error).message })
  }

  const onSubmit = verified ? finish : needsCode ? handleVerify : handleSignIn
  const buttonLabel = verified ? 'Try again' : needsCode ? 'Verify' : 'Sign In'

  return (
    <AuthLayout
      title={needsCode ? 'Check your email' : 'Welcome back'}
      subtitle={
        needsCode
          ? `Enter the code we sent to ${email.trim()}`
          : 'Sign in to keep managing your finances'
      }
    >
      {needsCode ? (
        <AuthField
          label="Verification Code"
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="off"
          textContentType="none"
          autoCorrect={false}
          value={code}
          onChangeText={edit(setCode)}
          error={errors.code}
        />
      ) : (
        <>
          <AuthField
            label="Email Address"
            placeholder="Enter your email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={edit(setEmail)}
            error={errors.email}
          />

          <View style={{ gap: 10 }}>
            {/* autoComplete/textContentType stop iOS from blocking typing */}
            <AuthField
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="off"
              textContentType="oneTimeCode"
              autoCorrect={false}
              autoCapitalize="none"
              value={password}
              onChangeText={edit(setPassword)}
              error={errors.password}
            />
            <Link
              href="/(auth)/forgot-password"
              style={{
                alignSelf: 'flex-end',
                fontFamily: authFonts.semibold,
                fontSize: 13,
                color: authColors.accent,
              }}
            >
              Forgot password?
            </Link>
          </View>
        </>
      )}

      {errors.form ? (
        <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.error }}>
          {errors.form}
        </Text>
      ) : null}

      <AuthButton label={buttonLabel} onPress={onSubmit} loading={busy} />

      {needsCode ? (
        <Pressable onPress={resend} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: authFonts.medium, fontSize: 13, color: authColors.muted }}>
            Didn't get a code? Send a new one
          </Text>
        </Pressable>
      ) : (
        <View className="flex-row justify-center gap-1">
          <Text style={{ fontFamily: authFonts.regular, fontSize: 13, color: authColors.muted }}>
            New to F-Tracker?
          </Text>
          <Link
            href="/(auth)/sign-up"
            style={{ fontFamily: authFonts.semibold, fontSize: 13, color: authColors.accent }}
          >
            Create an account
          </Link>
        </View>
      )}
    </AuthLayout>
  )
}


// import { useState } from 'react'
// import { Pressable, Text, View } from 'react-native'
// import { type Href, Link, useRouter } from 'expo-router'
// import { useSignIn } from '@clerk/expo'
// import AuthLayout from '@/components/auth/AuthLayout'
// import AuthField from '@/components/auth/AuthField'
// import AuthButton from '@/components/auth/AuthButton'
// import { authColors, authFonts } from '@/constants/authTheme'
// import { isValidEmail, parseClerkError } from '@/lib/clerk-errors'
// import type { AuthFormErrors } from '@/types/auth'

// export default function SignInScreen() {
//   const { signIn, fetchStatus } = useSignIn()
//   const router = useRouter()

//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [code, setCode] = useState('')
//   const [needsCode, setNeedsCode] = useState(false)
//   const [errors, setErrors] = useState<AuthFormErrors>({})

//   const busy = fetchStatus === 'fetching'

//   // Activates the session and sends the user to the home tabs
//   const finish = async () => {
//     await signIn.finalize({
//       navigate: ({ session, decorateUrl }) => {
//         if (session?.currentTask) return
//         const url = decorateUrl('/(tabs)')
//         if (url.startsWith('http')) window.location.href = url
//         else router.replace(url as Href)
//       },
//     })
//   }

//   const handleSignIn = async () => {
//     const next: AuthFormErrors = {}
//     if (!isValidEmail(email)) next.email = 'Enter a valid email address'
//     if (!password) next.password = 'Enter your password'
//     setErrors(next)
//     if (Object.keys(next).length) return

//     const { error } = await signIn.password({ emailAddress: email.trim(), password })
//     if (error) {
//       const { field, message } = parseClerkError(error)
//       return setErrors({ [field]: message })
//     }

//     if (signIn.status === 'complete') return finish()

//     // New device: Clerk asks for an email code
//     if (signIn.status === 'needs_client_trust') {
//       const factor = signIn.supportedSecondFactors?.find((f) => f.strategy === 'email_code')
//       if (factor) {
//         await signIn.mfa.sendEmailCode()
//         setCode('')
//         return setNeedsCode(true)
//       }
//     }

//     setErrors({ form: 'Extra verification is required that this app does not support yet.' })
//   }

//   const handleVerify = async () => {
//     if (code.trim().length < 6) return setErrors({ code: 'Enter the 6-digit code' })
//     setErrors({})

//     const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() })
//     if (error) return setErrors({ code: parseClerkError(error).message })

//     if (signIn.status === 'complete') return finish()
//     setErrors({ code: 'That code is not valid. Please try again.' })
//   }

//   const resend = async () => {
//     const res = await signIn.mfa.sendEmailCode()
//     if (res?.error) setErrors({ code: parseClerkError(res.error).message })
//   }

//   return (
//     <AuthLayout
//       title={needsCode ? 'Check your email' : 'Welcome back'}
//       subtitle={
//         needsCode
//           ? `Enter the code we sent to ${email.trim()}`
//           : 'Sign in to keep managing your subscriptions'
//       }
//     >
//       {needsCode ? (
//         // Email code step (new device)
//         <AuthField
//           label="Verification Code"
//           placeholder="000000"
//           keyboardType="number-pad"
//           maxLength={6}
//           autoComplete="off"
//           textContentType="none"
//           autoCorrect={false}
//           value={code}
//           onChangeText={setCode}
//           error={errors.code}
//         />
//       ) : (
//         // Email + password step
//         <>
//           <AuthField
//             label="Email Address"
//             placeholder="Enter your email"
//             autoCapitalize="none"
//             autoComplete="email"
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//             error={errors.email}
//           />

//           <View style={{ gap: 10 }}>
//             {/* autoComplete/textContentType stop iOS from blocking typing */}
//             <AuthField
//               label="Password"
//               placeholder="Enter your password"
//               secureTextEntry
//               autoComplete="off"
//               textContentType="oneTimeCode"
//               autoCorrect={false}
//               autoCapitalize="none"
//               value={password}
//               onChangeText={setPassword}
//               error={errors.password}
//             />
//             <Link
//               href="/(auth)/forgot-password"
//               style={{
//                 alignSelf: 'flex-end',
//                 fontFamily: authFonts.semibold,
//                 fontSize: 13,
//                 color: authColors.accent,
//               }}
//             >
//               Forgot password?
//             </Link>
//           </View>
//         </>
//       )}

//       {errors.form ? (
//         <Text style={{ fontFamily: authFonts.regular, fontSize: 12, color: authColors.error }}>
//           {errors.form}
//         </Text>
//       ) : null}

//       <AuthButton
//         label={needsCode ? 'Verify' : 'Sign In'}
//         onPress={needsCode ? handleVerify : handleSignIn}
//         loading={busy}
//       />

//       {needsCode ? (
//         <Pressable onPress={resend} style={{ alignItems: 'center' }}>
//           <Text style={{ fontFamily: authFonts.medium, fontSize: 13, color: authColors.muted }}>
//             Didn't get a code? Send a new one
//           </Text>
//         </Pressable>
//       ) : (
//         <View className="flex-row justify-center gap-1">
//           <Text style={{ fontFamily: authFonts.regular, fontSize: 13, color: authColors.muted }}>
//             New to Recurrly?
//           </Text>
//           <Link
//             href="/(auth)/sign-up"
//             style={{ fontFamily: authFonts.semibold, fontSize: 13, color: authColors.accent }}
//           >
//             Create an account
//           </Link>
//         </View>
//       )}
//     </AuthLayout>
//   )
// }