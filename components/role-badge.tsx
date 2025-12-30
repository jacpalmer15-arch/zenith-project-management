import { Badge } from '@/components/ui/badge'
import { Shield, Users, Wrench } from 'lucide-react'

export function RoleBadge({ role }: { role: 'ADMIN' | 'OFFICE' | 'TECH' }) {
  const config = {
    ADMIN: {
      label: 'Admin',
      icon: Shield,
      variant: 'destructive' as const
    },
    OFFICE: {
      label: 'Office',
      icon: Users,
      variant: 'default' as const
    },
    TECH: {
      label: 'Tech',
      icon: Wrench,
      variant: 'secondary' as const
    }
  }
  
  const { label, icon: Icon, variant } = config[role]
  
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
