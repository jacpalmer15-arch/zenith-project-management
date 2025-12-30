'use client'

import { useQuery } from '@tanstack/react-query'
import type { CurrentUser } from '@/lib/auth/get-user'

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  return res.json()
}

export function useCurrentUser() {
  const { data } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  return data
}
