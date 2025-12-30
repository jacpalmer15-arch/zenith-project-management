'use client'

import { hasPermission, type Permission } from '@/lib/auth/permissions'
import { useCurrentUser } from '@/hooks/use-current-user'

export function Can({ 
  permission, 
  children,
  fallback 
}: { 
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const user = useCurrentUser()
  
  if (!hasPermission(user?.role, permission)) {
    return fallback || null
  }
  
  return <>{children}</>
}
