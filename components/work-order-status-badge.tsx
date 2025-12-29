'use client'

import { WorkStatus } from '@/lib/db'
import { Badge } from '@/components/ui/badge'

interface WorkOrderStatusBadgeProps {
  status: WorkStatus
}

const statusConfig: Record<WorkStatus, { label: string; className: string }> = {
  UNSCHEDULED: { label: 'Unscheduled', className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  CLOSED: { label: 'Closed', className: 'bg-slate-200 text-slate-600 hover:bg-slate-200' },
  CANCELED: { label: 'Canceled', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
}

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  )
}
