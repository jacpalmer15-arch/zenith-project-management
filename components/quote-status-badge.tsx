import { Badge } from '@/components/ui/badge'
import type { QuoteStatus } from '@/lib/db'

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  Draft: { label: 'Draft', className: 'bg-gray-500' },
  Sent: { label: 'Sent', className: 'bg-blue-500' },
  Accepted: { label: 'Accepted', className: 'bg-green-500' },
  Rejected: { label: 'Rejected', className: 'bg-red-500' },
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config = statusConfig[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
