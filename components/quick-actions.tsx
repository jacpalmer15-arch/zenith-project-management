import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/app/quotes/new" className="block">
            <Button className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </Link>
          <Link href="/app/customers/new" className="block">
            <Button variant="secondary" className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </Link>
          <Link href="/app/projects/new" className="block">
            <Button variant="secondary" className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </Link>
          <Link href="/app/parts/new" className="block">
            <Button variant="secondary" className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Part
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
