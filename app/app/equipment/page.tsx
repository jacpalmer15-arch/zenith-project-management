import { listEquipment } from '@/lib/data'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function EquipmentPage() {
  const equipment = await listEquipment()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Equipment</h1>
        <Link href="/app/equipment/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Equipment
          </Button>
        </Link>
      </div>

      {equipment.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          <EmptyState
            icon={Wrench}
            title="No equipment yet"
            description="Create your first equipment to get started."
            action={{
              label: 'New Equipment',
              href: '/app/equipment/new',
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-slate-600">{item.serial_no || '-'}</TableCell>
                    <TableCell>${item.hourly_rate.toFixed(2)}/hr</TableCell>
                    <TableCell>${item.daily_rate.toFixed(2)}/day</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/app/equipment/${item.id}/edit`}>
                        <Button variant="ghost" size="sm" aria-label="Edit equipment">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view - cards */}
          <div className="md:hidden divide-y divide-slate-200">
            {equipment.map((item) => (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.serial_no || 'No serial #'}</p>
                  </div>
                  <Link href={`/app/equipment/${item.id}/edit`}>
                    <Button variant="ghost" size="icon" aria-label="Edit equipment" className="min-h-[44px] min-w-[44px]">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-sm text-slate-600">
                    <span>${item.hourly_rate.toFixed(2)}/hr</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span>${item.daily_rate.toFixed(2)}/day</span>
                  </div>
                  <Badge variant={item.is_active ? 'default' : 'secondary'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
