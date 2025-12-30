import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type RelatedEntity = {
  type: 'customer' | 'project' | 'work_order' | 'quote' | 'location'
  id: string
  label: string
  href: string
  metadata?: string
}

export function RelatedLinks({ 
  entities,
  title = 'Related' 
}: { 
  entities: RelatedEntity[]
  title?: string
}) {
  if (entities.length === 0) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entities.map((entity) => (
          <Link
            key={entity.id}
            href={entity.href}
            className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors"
          >
            <div>
              <div className="font-medium">{entity.label}</div>
              {entity.metadata && (
                <div className="text-sm text-muted-foreground">
                  {entity.metadata}
                </div>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
