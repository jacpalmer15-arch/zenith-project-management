import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@/lib/db'

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; className?: string }> = {
  Planning: { label: 'Planning', variant: 'secondary' },
  Quoted: { label: 'Quoted', variant: 'default', className: 'bg-blue-500 hover:bg-blue-600' },
  Active: { label: 'Active', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  Completed: { label: 'Completed', variant: 'default', className: 'bg-purple-500 hover:bg-purple-600' },
  Closed: { label: 'Closed', variant: 'outline' },
}

interface StatusBadgeProps {
  status: ProjectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
