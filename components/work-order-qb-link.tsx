import { WorkOrder } from '@/lib/db'

interface WorkOrderQbLinkProps {
  workOrder: WorkOrder
}

export function WorkOrderQbLink({ workOrder }: WorkOrderQbLinkProps) {
  if (!workOrder.qb_subcustomer_id) {
    return (
      <div className="text-sm text-muted-foreground">
        Not linked to QuickBooks
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">QuickBooks Job</p>
      <p className="text-sm text-muted-foreground">
        {workOrder.qb_subcustomer_name || 'Linked'}
      </p>
      <p className="text-xs text-muted-foreground">
        Job ID: {workOrder.qb_subcustomer_id}
      </p>
    </div>
  )
}
