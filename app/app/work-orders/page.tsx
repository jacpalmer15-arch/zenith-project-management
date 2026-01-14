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
import { Eye, Briefcase, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WorkOrderStatusBadge } from '@/components/work-order-status-badge'
import { formatDistanceToNow } from 'date-fns'
import { EmptyState } from '@/components/empty-state'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function WorkOrdersPage() {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_work_orders')) {
    redirect('/app/dashboard')
  }
  const workOrders = await listWorkOrders(
    user?.role === 'TECH' && user.employee?.id
      ? { assigned_to: user.employee.id }
      : undefined
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-slate-600 mt-1">Service work orders and field jobs</p>
        </div>
        {hasPermission(user?.role, 'edit_work_orders') && (
          <Link href="/app/work-orders/new">
            <Button className="w-full sm:w-auto">New Work Order</Button>
          </Link>
        )}
      </div>

      {workOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          <EmptyState
            icon={ClipboardList}
            title="No work orders yet"
            description="Create a work order to schedule service."
            action={{
              label: 'New Work Order',
              href: '/app/work-orders/new',
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop view - table with horizontal scroll */}
          <div className="hidden lg:block overflow-x-auto">
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
                        <Button variant="ghost" size="icon" aria-label="View work order">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view - cards stacked */}
          <div className="lg:hidden divide-y divide-slate-200">
            {workOrders.map((wo) => (
              <div key={wo.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{wo.work_order_no}</p>
                    <p className="text-sm text-slate-600 truncate">{wo.summary}</p>
                  </div>
                  <Link href={`/app/work-orders/${wo.id}`}>
                    <Button variant="ghost" size="icon" aria-label="View work order" className="min-h-[44px] min-w-[44px]">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <WorkOrderStatusBadge status={wo.status} />
                  <Badge variant="outline">P{wo.priority}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-900 font-medium">{wo.customer.name}</p>
                  <p className="text-slate-600">
                    {wo.location.city}, {wo.location.state}
                  </p>
                  {wo.assigned_employee && (
                    <p className="text-slate-600">
                      Assigned: {wo.assigned_employee.display_name}
                    </p>
                  )}
                  <p className="text-slate-500">
                    Updated {formatDistanceToNow(new Date(wo.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
