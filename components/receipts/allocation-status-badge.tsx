import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Circle, AlertTriangle, FileX } from 'lucide-react'

interface AllocationStatusBadgeProps {
  status: 'UNALLOCATED' | 'PARTIAL' | 'ALLOCATED' | 'OVERALLOCATED' | 'NO_LINES'
}

export function AllocationStatusBadge({ status }: AllocationStatusBadgeProps) {
  const config = {
    UNALLOCATED: {
      label: 'Unallocated',
      variant: 'secondary' as const,
      icon: Circle,
      className: 'bg-slate-100 text-slate-700 border-slate-300'
    },
    PARTIAL: {
      label: 'Partial',
      variant: 'default' as const,
      icon: AlertCircle,
      className: 'bg-amber-100 text-amber-700 border-amber-300'
    },
    ALLOCATED: {
      label: 'Allocated',
      variant: 'default' as const,
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 border-green-300'
    },
    OVERALLOCATED: {
      label: 'Overallocated',
      variant: 'destructive' as const,
      icon: AlertTriangle,
      className: 'bg-red-100 text-red-700 border-red-300'
    },
    NO_LINES: {
      label: 'No Lines',
      variant: 'secondary' as const,
      icon: FileX,
      className: 'bg-slate-100 text-slate-500 border-slate-300'
    }
  }
  
  const { label, icon: Icon, className } = config[status] || config.UNALLOCATED
  
  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  )
}
