'use server'

import { getProjectJobCosts, getWorkOrderJobCosts, JobCostFilters } from '@/lib/data/reports'

/**
 * Escape CSV field value according to RFC 4180
 */
function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

export async function exportJobCostsCSV(
  targetType: 'project' | 'work_order',
  targetId: string,
  filters?: JobCostFilters
) {
  const costs = targetType === 'project' 
    ? await getProjectJobCosts(targetId, filters)
    : await getWorkOrderJobCosts(targetId, filters)
  
  const headers = ['Date', 'Cost Type', 'Cost Code', 'Description', 'Qty', 'Unit Cost', 'Amount', 'Source']
  const rows = costs.map(cost => [
    escapeCsvField(cost.txn_date || ''),
    escapeCsvField(cost.cost_type?.name || ''),
    escapeCsvField(cost.cost_code?.code || ''),
    escapeCsvField(cost.description || cost.part?.name || ''),
    escapeCsvField(cost.qty),
    escapeCsvField(cost.unit_cost),
    escapeCsvField(cost.amount),
    escapeCsvField(cost.receipt ? `Receipt: ${cost.receipt.vendor_name}` : 'Manual')
  ])
  
  const csv = [headers.map(escapeCsvField), ...rows].map(row => row.join(',')).join('\n')
  return csv
}
