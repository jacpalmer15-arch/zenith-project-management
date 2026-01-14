import { getLocation, listWorkOrders } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WorkOrderStatusBadge } from '@/components/work-order-status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function LocationDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_customers')) {
    redirect('/app/dashboard')
  }
  let location
  
  try {
    location = await getLocation(params.id)
  } catch (error) {
    notFound()
  }

  // Get work orders for this location
  const workOrders = await listWorkOrders({
    customer_id: location.customer_id,
    assigned_to: user?.role === 'TECH' ? user.employee?.id : undefined,
  })
  const locationWorkOrders = workOrders.filter(wo => wo.location_id === params.id)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {location.label || 'Location'}
          </h1>
          {location.is_active ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Active
            </Badge>
          ) : (
            <Badge variant="outline">
              Inactive
            </Badge>
          )}
        </div>
        {hasPermission(user?.role, 'edit_customers') && (
          <Link href={`/app/locations/${params.id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Address Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Address</h2>
          </div>
          <div className="space-y-2 text-slate-600">
            <p>{location.street}</p>
            <p>{location.city}, {location.state} {location.zip}</p>
          </div>
        </div>

        {/* Customer Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer</h2>
          <div className="space-y-2">
            <p className="font-medium text-slate-900">{location.customer.name}</p>
            <p className="text-sm text-slate-600">{location.customer.customer_no}</p>
            <Link href={`/app/customers/${location.customer.id}/edit`}>
              <Button variant="outline" size="sm" className="mt-2">
                View Customer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Notes */}
      {location.notes && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Notes</h2>
          <p className="text-slate-600 whitespace-pre-wrap">{location.notes}</p>
        </div>
      )}

      {/* Work Orders */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Work Orders ({locationWorkOrders.length})
        </h2>
        
        {locationWorkOrders.length === 0 ? (
          <p className="text-slate-500">No work orders for this location yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationWorkOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.work_order_no}</TableCell>
                  <TableCell>
                    <WorkOrderStatusBadge status={wo.status} />
                  </TableCell>
                  <TableCell>{wo.summary}</TableCell>
                  <TableCell>
                    <Badge variant="outline">P{wo.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/work-orders/${wo.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
