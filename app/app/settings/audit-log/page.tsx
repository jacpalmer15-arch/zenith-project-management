import { listAuditLogs } from '@/lib/data/audit-logs'
import { AuditLogClient } from './client'

export default async function AuditLogPage() {
  const { data } = await listAuditLogs({ limit: 50 })

  return <AuditLogClient initialData={data} />
}
