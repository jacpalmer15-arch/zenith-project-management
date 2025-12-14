import { Badge } from '@/components/ui/badge'

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge 
      variant={isActive ? 'default' : 'outline'} 
      className={isActive ? 'bg-green-500 hover:bg-green-600' : ''}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}
