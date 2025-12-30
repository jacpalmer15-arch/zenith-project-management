import { getWorkOrder } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, MapPin, User } from 'lucide-react'
import { WorkOrderStatusDropdown } from '@/components/work-order-status-dropdown'
import { WorkOrderCloseoutDialog } from '@/components/work-order-closeout-dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  let workOrder
  
  try {
    workOrder = await getWorkOrder(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {workOrder.work_order_no}
          </h1>
          <WorkOrderStatusDropdown 
            workOrderId={params.id}
            currentStatus={workOrder.status}
          />
          <Badge variant="outline">Priority {workOrder.priority}</Badge>
        </div>
        <div className="flex gap-2">
          {workOrder.status === 'COMPLETED' && (
            <WorkOrderCloseoutDialog workOrderId={params.id} />
          )}
          <Link href={`/app/work-orders/${params.id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Customer Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer</h2>
          <div className="space-y-2">
            <p className="font-medium text-slate-900">{workOrder.customer.name}</p>
            <p className="text-sm text-slate-600">{workOrder.customer.customer_no}</p>
            {workOrder.customer.phone && (
              <p className="text-sm text-slate-600">{workOrder.customer.phone}</p>
            )}
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Location</h2>
          </div>
          <div className="space-y-1 text-slate-600">
            {workOrder.location.label && (
              <p className="font-medium">{workOrder.location.label}</p>
            )}
            <p className="text-sm">{workOrder.location.street}</p>
            <p className="text-sm">{workOrder.location.city}, {workOrder.location.state} {workOrder.location.zip}</p>
          </div>
        </div>

        {/* Assigned To Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Assigned To</h2>
          </div>
          <div className="space-y-2">
            {workOrder.assigned_employee ? (
              <>
                <p className="font-medium text-slate-900">{workOrder.assigned_employee.display_name}</p>
                <Badge variant="outline">{workOrder.assigned_employee.role}</Badge>
              </>
            ) : (
              <p className="text-slate-500">Unassigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary & Description */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Work Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-1">Summary</h3>
            <p className="text-slate-900">{workOrder.summary}</p>
          </div>
          {workOrder.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{workOrder.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Opened</p>
            <p className="font-medium text-slate-900">
              {format(new Date(workOrder.opened_at), 'PPP p')}
            </p>
          </div>
          {workOrder.requested_window_start && (
            <div>
              <p className="text-slate-600">Requested Window Start</p>
              <p className="font-medium text-slate-900">
                {format(new Date(workOrder.requested_window_start), 'PPP p')}
              </p>
            </div>
          )}
          {workOrder.requested_window_end && (
            <div>
              <p className="text-slate-600">Requested Window End</p>
              <p className="font-medium text-slate-900">
                {format(new Date(workOrder.requested_window_end), 'PPP p')}
              </p>
            </div>
          )}
          {workOrder.completed_at && (
            <div>
              <p className="text-slate-600">Completed</p>
              <p className="font-medium text-slate-900">
                {format(new Date(workOrder.completed_at), 'PPP p')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Totals */}
      {(workOrder.contract_total > 0) && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Contract</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">
                ${workOrder.contract_subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium text-slate-900">
                ${workOrder.contract_tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-semibold text-slate-900">
                ${workOrder.contract_total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
