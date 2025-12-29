import { getWorkOrderProfitability } from '@/lib/data/reports'
import { WorkOrderProfitabilityClient } from './client'

export default async function WorkOrderProfitabilityPage() {
  const data = await getWorkOrderProfitability()

  return <WorkOrderProfitabilityClient initialData={data} />
}
