'use server'

import { getProjectJobCosts, getWorkOrderJobCosts } from '@/lib/data/reports'

export async function exportJobCostsCSV(
  targetType: 'project' | 'work_order',
  targetId: string
) {
  const costs = targetType === 'project' 
    ? await getProjectJobCosts(targetId)
    : await getWorkOrderJobCosts(targetId)
  
  const headers = ['Date', 'Cost Type', 'Cost Code', 'Description', 'Qty', 'Unit Cost', 'Amount', 'Source']
  const rows = costs.map(cost => [
    cost.txn_date || '',
    cost.cost_type?.name || '',
    cost.cost_code?.code || '',
    cost.description || cost.part?.name || '',
    cost.qty,
    cost.unit_cost,
    cost.amount,
    cost.receipt ? `Receipt: ${cost.receipt.vendor_name}` : 'Manual'
  ])
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  return csv
}
