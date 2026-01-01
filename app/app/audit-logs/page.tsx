import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { getAuditLogEntries } from '@/lib/data/audit-logs'
import { AuditLogsClient } from './client'

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { 
    table?: string
    action?: 'INSERT' | 'UPDATE' | 'DELETE'
    user_id?: string
    record_id?: string
    start_date?: string
    end_date?: string
    page?: string
  }
}) {
  const user = await getCurrentUser()
  
  if (!user || !hasPermission(user.role, 'view_audit_logs')) {
    redirect('/app/dashboard')
  }

  const page = parseInt(searchParams.page || '1', 10)
  const limit = 50
  const offset = (page - 1) * limit

  const { data: logs, count } = await getAuditLogEntries({
    table_name: searchParams.table,
    action: searchParams.action,
    user_id: searchParams.user_id,
    record_id: searchParams.record_id,
    start_date: searchParams.start_date,
    end_date: searchParams.end_date,
    limit,
    offset,
  })

  return (
    <AuditLogsClient
      logs={logs}
      totalCount={count}
      currentPage={page}
      pageSize={limit}
    />
  )
}
