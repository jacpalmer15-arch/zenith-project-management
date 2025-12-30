import { Badge } from '@/components/ui/badge'
import type { QuoteStatus } from '@/lib/db'

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-500' },
  SENT: { label: 'Sent', className: 'bg-blue-500' },
  ACCEPTED: { label: 'Accepted', className: 'bg-green-500' },
  REJECTED: { label: 'Rejected', className: 'bg-red-500' },
  EXPIRED: { label: 'Expired', className: 'bg-yellow-500' },
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config = statusConfig[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
