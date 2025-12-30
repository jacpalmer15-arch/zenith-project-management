import { Badge } from '@/components/ui/badge'

const statusConfig: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Unpaid', className: 'bg-gray-500' },
  partial: { label: 'Partially Paid', className: 'bg-yellow-500' },
  paid: { label: 'Paid', className: 'bg-green-500' },
}

export function BillStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <Badge variant="secondary">Not Synced</Badge>
  }

  const config = statusConfig[status] || statusConfig.unpaid
  return <Badge className={config.className}>{config.label}</Badge>
}
