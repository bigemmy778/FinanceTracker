export function filterSubscriptions(list: Subscription[], query: string): Subscription[] {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return list
  
    return list.filter((s) => {
      const haystack = [s.name, s.plan, s.category, s.paymentMethod, s.status, s.billing]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return tokens.every((t) => haystack.includes(t))
    })
  }