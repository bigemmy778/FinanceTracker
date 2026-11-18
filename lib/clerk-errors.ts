export type AuthErrorField =
  | 'email' | 'password' | 'phone' | 'code'
  | 'firstName' | 'lastName' | 'username' | 'form'

export function parseClerkError(error: unknown): { field: AuthErrorField; message: string } {
  const e = error as {
    longMessage?: string
    message?: string
    errors?: { longMessage?: string; message?: string; meta?: { paramName?: string } }[]
  } | null

  const first = e?.errors?.[0]
  const message =
    e?.longMessage ??
    first?.longMessage ??
    e?.message ??
    first?.message ??
    'Something went wrong. Please try again.'

  const param = (first?.meta?.paramName ?? '').toLowerCase()
  const text = message.toLowerCase()

  let field: AuthErrorField = 'form'
  if (param.includes('first_name')) field = 'firstName'
  else if (param.includes('last_name')) field = 'lastName'
  else if (param.includes('username')) field = 'username'
  else if (param.includes('phone')) field = 'phone'
  else if (param.includes('password') || (!param && text.includes('password'))) field = 'password'
  else if (param.includes('email') || param.includes('identifier')) field = 'email'
  else if (param.includes('code')) field = 'code'

  return { field, message }
}

export function getErrorMessage(error: unknown): string {
  return parseClerkError(error).message
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Converts "08012345678", "8012345678", "+2348012345678" -> "+2348012345678"
export function toE164(input: string, defaultCountry = '234'): string | null {
  const raw = input.trim().replace(/[\s\-().]/g, '')
  let digits: string

  if (raw.startsWith('+')) digits = raw.slice(1)
  else if (raw.startsWith('00')) digits = raw.slice(2)
  else if (raw.startsWith('0')) digits = defaultCountry + raw.slice(1)
  else if (raw.length === 10) digits = defaultCountry + raw
  else digits = raw

  return /^\d{8,15}$/.test(digits) ? `+${digits}` : null
}