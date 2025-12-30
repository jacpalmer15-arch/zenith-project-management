'use server'

import { createClient } from '@/lib/supabase/serverClient'

export interface QbActualCost {
  id: string
  work_order_id: string
  cost_type: 'labor' | 'material' | 'equipment' | 'subcontractor' | 'other'
  actual_amount: number
  qb_source_type: string
  qb_source_id: string
  snapshot_date: string
  created_at: Date
  updated_at: Date
}

export interface QbActualCostInsert {
  work_order_id: string
  cost_type: 'labor' | 'material' | 'equipment' | 'subcontractor' | 'other'
  actual_amount: number
  qb_source_type: string
  qb_source_id: string
  snapshot_date?: string
}

/**
 * Get actual costs for a work order
 */
export async function getActualCosts(workOrderId: string): Promise<{
  labor: number
  material: number
  equipment: number
  subcontractor: number
  other: number
  total: number
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('qb_actual_costs')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('snapshot_date', { ascending: false })

  if (error) {
    throw new Error(`Failed to get actual costs: ${error.message}`)
  }

  const totals = {
    labor: 0,
    material: 0,
    equipment: 0,
    subcontractor: 0,
    other: 0,
  }

  // Get the most recent snapshot for each cost type
  const latestCosts = new Map<string, number>()
  
  data?.forEach((cost: any) => {
    if (!latestCosts.has(cost.cost_type)) {
      latestCosts.set(cost.cost_type, parseFloat(cost.actual_amount))
    }
  })

  latestCosts.forEach((amount, costType) => {
    if (costType in totals) {
      totals[costType as keyof typeof totals] = amount
    }
  })

  return {
    ...totals,
    total: Object.values(totals).reduce((sum, val) => sum + val, 0),
  }
}

/**
 * Upsert (insert or update) an actual cost entry
 */
export async function upsertActualCost(data: QbActualCostInsert): Promise<QbActualCost> {
  const supabase = await createClient()

  const snapshotDate = data.snapshot_date || new Date().toISOString().split('T')[0]

  const { data: result, error } = await (supabase
    .from('qb_actual_costs') as any)
    .upsert(
      {
        ...data,
        snapshot_date: snapshotDate,
      },
      {
        onConflict: 'work_order_id,cost_type,snapshot_date',
      }
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert actual cost: ${error.message}`)
  }

  return result as QbActualCost
}

/**
 * List actual costs with optional filters
 */
export async function listActualCosts(filters?: {
  work_order_id?: string
  snapshot_date?: string
}): Promise<QbActualCost[]> {
  const supabase = await createClient()

  let query = supabase
    .from('qb_actual_costs')
    .select('*')
    .order('snapshot_date', { ascending: false })

  if (filters?.work_order_id) {
    query = query.eq('work_order_id', filters.work_order_id)
  }

  if (filters?.snapshot_date) {
    query = query.eq('snapshot_date', filters.snapshot_date)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list actual costs: ${error.message}`)
  }

  return (data || []) as QbActualCost[]
}

/**
 * Delete actual costs for a work order
 */
export async function deleteActualCosts(workOrderId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('qb_actual_costs')
    .delete()
    .eq('work_order_id', workOrderId)

  if (error) {
    throw new Error(`Failed to delete actual costs: ${error.message}`)
  }
}
