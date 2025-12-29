import Link from 'next/link'
import { listWorkOrders } from '@/lib/data'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WorkOrderStatusBadge } from '@/components/work-order-status-badge'
import { formatDistanceToNow } from 'date-fns'

export default async function WorkOrdersPage() {
  const workOrders = await listWorkOrders()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-slate-600 mt-1">Service work orders and field jobs</p>
        </div>
        <Link href="/app/work-orders/new">
          <Button>New Work Order</Button>
        </Link>
      </div>

      {workOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">
            No work orders yet. Create your first work order to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.work_order_no}</TableCell>
                  <TableCell>
                    <WorkOrderStatusBadge status={wo.status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">P{wo.priority}</Badge>
                  </TableCell>
                  <TableCell>{wo.customer.name}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {wo.location.city}, {wo.location.state}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{wo.summary}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {wo.assigned_employee?.display_name || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDistanceToNow(new Date(wo.updated_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/work-orders/${wo.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
