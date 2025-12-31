'use server'
import { getWorkOrder, listJobCostEntries } from '@/lib/data'

export type ProfitPreview = {
  workOrderId: string
  workOrderNo: string
  contractTotal: number
  laborCost: number
  materialCost: number
  equipmentCost: number
  subcontractorCost: number
  overheadCost: number
  otherCost: number
  totalCost: number
  estimatedProfit: number
  profitMarginPct: number
  status: 'profit' | 'breakeven' | 'loss'
  isEstimate: boolean
  warnings: string[]
}

export async function calculateProfitPreview(
  workOrderId: string
): Promise<ProfitPreview> {
  const [workOrder, costEntries] = await Promise.all([
    getWorkOrder(workOrderId),
    listJobCostEntries({ work_order_id: workOrderId })
  ])
  
  // Aggregate costs by bucket
  type CostBucket = 'LABOR' | 'MATERIAL' | 'EQUIPMENT' | 'SUB' | 'OVERHEAD' | 'OTHER'
  
  const costs: Record<CostBucket, number> = {
    LABOR: 0,
    MATERIAL: 0,
    EQUIPMENT: 0,
    SUB: 0,
    OVERHEAD: 0,
    OTHER: 0
  }
  
  for (const entry of costEntries) {
    const bucket = entry.bucket as CostBucket
    if (bucket in costs) {
      costs[bucket] += entry.total_cost
    }
  }
  
  const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0)
  const contractTotal = workOrder.contract_total || 0
  const estimatedProfit = contractTotal - totalCost
  const profitMarginPct = contractTotal > 0 
    ? (estimatedProfit / contractTotal) * 100 
    : 0
  
  // Determine status
  let status: 'profit' | 'breakeven' | 'loss'
  if (estimatedProfit > 0) {
    status = 'profit'
  } else if (estimatedProfit === 0) {
    status = 'breakeven'
  } else {
    status = 'loss'
  }
  
  // Generate warnings
  const warnings: string[] = []
  
  if (contractTotal === 0) {
    warnings.push('No contract total (no accepted quote)')
  }
  
  if (workOrder.status !== 'CLOSED') {
    warnings.push('Work order not closed - costs may be incomplete')
  }
  
  if (totalCost === 0 && workOrder.status !== 'UNSCHEDULED') {
    warnings.push('No costs captured')
  }
  
  return {
    workOrderId,
    workOrderNo: workOrder.work_order_no || 'N/A',
    contractTotal,
    laborCost: costs.LABOR,
    materialCost: costs.MATERIAL,
    equipmentCost: costs.EQUIPMENT,
    subcontractorCost: costs.SUB,
    overheadCost: costs.OVERHEAD,
    otherCost: costs.OTHER,
    totalCost,
    estimatedProfit,
    profitMarginPct,
    status,
    isEstimate: workOrder.status !== 'CLOSED',
    warnings
  }
}

export async function calculateMultipleWorkOrderProfits(
  workOrderIds: string[]
): Promise<ProfitPreview[]> {
  const results = await Promise.all(
    workOrderIds.map(id => calculateProfitPreview(id))
  )
  return results
}

export async function calculateProfitSummary(
  workOrderIds: string[]
): Promise<{
  totalRevenue: number
  totalCosts: number
  totalProfit: number
  averageMarginPct: number
  profitableCount: number
  lossCount: number
}> {
  const previews = await calculateMultipleWorkOrderProfits(workOrderIds)
  
  const totalRevenue = previews.reduce((sum, p) => sum + p.contractTotal, 0)
  const totalCosts = previews.reduce((sum, p) => sum + p.totalCost, 0)
  const totalProfit = totalRevenue - totalCosts
  const averageMarginPct = totalRevenue > 0 
    ? (totalProfit / totalRevenue) * 100 
    : 0
  
  const profitableCount = previews.filter(p => p.status === 'profit').length
  const lossCount = previews.filter(p => p.status === 'loss').length
  
  return {
    totalRevenue,
    totalCosts,
    totalProfit,
    averageMarginPct,
    profitableCount,
    lossCount
  }
}
