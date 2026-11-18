export type AuthFormErrors = {
    email?: string
    password?: string
    confirmPassword?: string
    phone?: string
    code?: string
    firstName?: string
    lastName?: string
    username?: string
    form?: string
}

export type VerificationStep = 'credentials' | 'verify' | 'verifyPhone' | 'details'

export type ResetStep = 'email' | 'code' | 'password'

export type AppUser = {
    id: string
    email: string | null
    firstName: string | null
    imageUrl: string
}