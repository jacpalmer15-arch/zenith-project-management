import { listWorkOrders } from '@/lib/data'
import { calculateMultipleWorkOrderProfits } from '@/lib/reporting/profit-preview'
import { WorkOrderProfitabilityClient } from './client'

export default async function WorkOrderProfitabilityPage() {
  // Get all work orders (or filter as needed)
  const workOrders = await listWorkOrders({})
  
  // Calculate profits for all work orders
  const profits = await calculateMultipleWorkOrderProfits(
    workOrders.map(wo => wo.id)
  )

  return <WorkOrderProfitabilityClient initialData={profits} workOrders={workOrders} />
}
