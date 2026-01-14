import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'

export default async function QuotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_quotes')) {
    redirect('/app/dashboard')
  }

  return <>{children}</>
}
