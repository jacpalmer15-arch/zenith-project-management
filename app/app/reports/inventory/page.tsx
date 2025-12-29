import { getInventoryReport } from '@/lib/data/reports'
import { InventoryClient } from './client'

export default async function InventoryPage() {
  const data = await getInventoryReport()

  return <InventoryClient initialData={data} />
}
