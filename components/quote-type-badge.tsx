import { Badge } from '@/components/ui/badge'
import type { QuoteType } from '@/lib/db'

export function QuoteTypeBadge({ type }: { type: QuoteType }) {
  if (type === 'BASE') {
    return <Badge variant="default">Base</Badge>
  }
  
  return <Badge className="bg-orange-500">Change Order</Badge>
}
