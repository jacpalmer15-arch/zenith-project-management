'use server'

import { getSettings, getEmployee, listTimeEntries, createCostEntry } from '@/lib/data'
import { createClient } from '@/lib/supabase/serverClient'
import { WorkOrderTimeEntry, CostEntry } from '@/lib/db'

export interface LaborPostResult {
  success: boolean
  error?: string
  costEntries?: CostEntry[]
  totalHours?: number
  totalCost?: number
}

/**
 * Post labor costs for a work order based on completed time entries
 * Idempotent - safe to retry
 */
export async function postLaborCosts(
  workOrderId: string
): Promise<LaborPostResult> {
  const supabase = await createClient()
  
  // Check if already posted
  const { data: existingCosts, error: checkError } = await supabase
    .from('cost_entries')
    .select('*')
    .eq('work_order_id', workOrderId)
    .eq('bucket', 'LABOR')
    .eq('origin', 'ZENITH_CAPTURED')
  
  if (checkError) {
    return {
      success: false,
      error: `Failed to check existing costs: ${checkError.message}`
    }
  }
  
  if (existingCosts && existingCosts.length > 0) {
    return {
      success: false,
      error: 'Labor costs already posted for this work order'
    }
  }
  
  // Get all completed time entries
  const timeEntries = await listTimeEntries({
    work_order_id: workOrderId
  })
  
  const completedEntries = timeEntries.filter(e => e.clock_out_at)
  
  if (completedEntries.length === 0) {
    return {
      success: false,
      error: 'No completed time entries to post'
    }
  }
  
  // Get default labor rate
  const settings = await getSettings()
  const laborRate = settings.default_labor_rate || 0
  
  // Aggregate by employee
  const byEmployee = completedEntries.reduce((acc, entry) => {
    const hours = calculateHours(entry)
    acc[entry.tech_user_id] = (acc[entry.tech_user_id] || 0) + hours
    return acc
  }, {} as Record<string, number>)
  
  // Create cost entries
  const costEntries: CostEntry[] = []
  for (const [employeeId, hours] of Object.entries(byEmployee)) {
    const employee = await getEmployee(employeeId)
    
    const costEntry = await createCostEntry({
      work_order_id: workOrderId,
      bucket: 'LABOR',
      origin: 'ZENITH_CAPTURED',
      description: `Labor - ${employee.display_name}`,
      qty: hours,
      unit_cost: laborRate,
      total_cost: hours * laborRate,
      occurred_at: new Date().toISOString()
    })
    
    costEntries.push(costEntry)
  }
  
  return {
    success: true,
    costEntries,
    totalHours: Object.values(byEmployee).reduce((a, b) => a + b, 0),
    totalCost: costEntries.reduce((sum, e) => sum + e.total_cost, 0)
  }
}

/**
 * Calculate billable hours from a time entry
 */
function calculateHours(entry: WorkOrderTimeEntry): number {
  if (!entry.clock_out_at) return 0
  
  const start = new Date(entry.clock_in_at)
  const end = new Date(entry.clock_out_at)
  const totalMinutes = (end.getTime() - start.getTime()) / 1000 / 60
  const workMinutes = totalMinutes - (entry.break_minutes || 0)
  
  return workMinutes / 60
}
