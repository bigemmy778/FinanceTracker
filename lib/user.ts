type UserLike = {
    firstName?: string | null
    lastName?: string | null
    username?: string | null
    primaryEmailAddress?: { emailAddress: string } | null
  }
  
  // Name -> username -> email, so skipping the username still gives a sensible label
  export function getDisplayName(user: UserLike | null | undefined) {
    if (!user) return ''
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    return fullName || user.username || user.primaryEmailAddress?.emailAddress || 'there'
  }