import { Badge } from '@/components/ui/badge'

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-500' },
  sent: { label: 'Sent', className: 'bg-blue-500' },
  partial: { label: 'Partially Paid', className: 'bg-yellow-500' },
  paid: { label: 'Paid', className: 'bg-green-500' },
  overdue: { label: 'Overdue', className: 'bg-red-500' },
}

export function InvoiceStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <Badge variant="secondary">Not Invoiced</Badge>
  }

  const config = statusConfig[status] || statusConfig.draft
  return <Badge className={config.className}>{config.label}</Badge>
}
