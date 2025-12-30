'use server'
import { getWorkOrder } from '@/lib/data/work-orders'
import { listCostEntries } from '@/lib/data/cost-entries'
import { formatCurrency } from '@/lib/utils/format-currency'
import { WorkOrderWithCustomerLocation } from '@/lib/db'

export type CostBreakdown = {
  LABOR: number
  MATERIAL: number
  EQUIPMENT: number
  SUB: number
  OVERHEAD: number
  OTHER: number
  total: number
}

export type CostReconciliation = {
  workOrder: WorkOrderWithCustomerLocation
  contract_total: number
  actual_costs: CostBreakdown
  estimated_margin: number
  margin_pct: number
  margin_status: 'positive' | 'low' | 'negative'
  warnings: string[]
}

export async function getCostReconciliation(
  workOrderId: string
): Promise<CostReconciliation> {
  const [wo, costEntries] = await Promise.all([
    getWorkOrder(workOrderId),
    listCostEntries({ work_order_id: workOrderId })
  ])
  
  // Group costs by bucket
  const breakdown: CostBreakdown = {
    LABOR: 0,
    MATERIAL: 0,
    EQUIPMENT: 0,
    SUB: 0,
    OVERHEAD: 0,
    OTHER: 0,
    total: 0
  }
  
  for (const entry of costEntries) {
    breakdown[entry.bucket as keyof Omit<CostBreakdown, 'total'>] += entry.total_cost
    breakdown.total += entry.total_cost
  }
  
  const contractTotal = wo.contract_total || 0
  const estimatedMargin = contractTotal - breakdown.total
  const marginPct = contractTotal > 0 
    ? (estimatedMargin / contractTotal) * 100 
    : 0
  
  // Determine margin status
  let marginStatus: 'positive' | 'low' | 'negative'
  if (marginPct < 0) {
    marginStatus = 'negative'
  } else if (marginPct < 10) {
    marginStatus = 'low'
  } else {
    marginStatus = 'positive'
  }
  
  // Generate warnings
  const warnings: string[] = []
  
  if (contractTotal === 0) {
    warnings.push('No contract total set (no accepted quote)')
  }
  
  if (marginStatus === 'negative') {
    warnings.push(`Over budget by ${formatCurrency(Math.abs(estimatedMargin))}`)
  } else if (marginStatus === 'low') {
    warnings.push(`Low margin: ${marginPct.toFixed(1)}%`)
  }
  
  if (breakdown.total === 0 && wo.status !== 'UNSCHEDULED') {
    warnings.push('No costs captured yet')
  }
  
  return {
    workOrder: wo,
    contract_total: contractTotal,
    actual_costs: breakdown,
    estimated_margin: estimatedMargin,
    margin_pct: marginPct,
    margin_status: marginStatus,
    warnings
  }
}
