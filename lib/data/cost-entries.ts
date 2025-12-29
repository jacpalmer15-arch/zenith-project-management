'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { CostEntry, CostEntryInsert, CostEntryUpdate, CostEntryWithRelations, CostBucket } from '@/lib/db'

export interface ListCostEntriesOptions {
  work_order_id?: string
  bucket?: CostBucket
  origin?: 'ZENITH_ESTIMATE' | 'ZENITH_CAPTURED' | 'QB_SYNCED'
  start_date?: string
  end_date?: string
}

export interface CostRollup {
  bucket: CostBucket
  total: number
}

export interface WorkOrderCostSummary {
  rollup: CostRollup[]
  grand_total: number
  contract_total?: number
  estimated_margin?: number
}

/**
 * List all cost entries with optional filters
 */
export async function listCostEntries(
  options?: ListCostEntriesOptions
): Promise<CostEntryWithRelations[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('cost_entries')
    .select(`
      *,
      work_order:work_orders(*, customer:customers(*)),
      part:parts(*)
    `)
    .order('occurred_at', { ascending: false })
  
  if (options?.work_order_id) {
    query = query.eq('work_order_id', options.work_order_id)
  }

  if (options?.bucket) {
    query = query.eq('bucket', options.bucket)
  }

  if (options?.origin) {
    query = query.eq('origin', options.origin)
  }

  if (options?.start_date) {
    query = query.gte('occurred_at', options.start_date)
  }

  if (options?.end_date) {
    query = query.lte('occurred_at', options.end_date)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list cost entries: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single cost entry by ID
 */
export async function getCostEntry(id: string): Promise<CostEntryWithRelations> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cost_entries')
    .select(`
      *,
      work_order:work_orders(*, customer:customers(*)),
      part:parts(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get cost entry: ${error.message}`)
  }

  return data
}

/**
 * Create a new cost entry
 */
export async function createCostEntry(costEntry: CostEntryInsert): Promise<CostEntry> {
  const supabase = await createClient()

  // Calculate total_cost from qty and unit_cost
  const total_cost = (costEntry.qty || 1) * (costEntry.unit_cost || 0)

  const { data, error } = await supabase
    .from('cost_entries')
    .insert({
      ...costEntry,
      total_cost,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create cost entry: ${error.message}`)
  }

  return data
}

/**
 * Update an existing cost entry
 */
export async function updateCostEntry(
  id: string,
  costEntry: CostEntryUpdate
): Promise<CostEntry> {
  const supabase = await createClient()

  // Recalculate total_cost if qty or unit_cost changed
  const updates: CostEntryUpdate = { ...costEntry }
  if (costEntry.qty !== undefined || costEntry.unit_cost !== undefined) {
    // Fetch current values if not provided
    const { data: current } = await supabase
      .from('cost_entries')
      .select('qty, unit_cost')
      .eq('id', id)
      .single()

    if (current) {
      const qty = costEntry.qty !== undefined ? costEntry.qty : current.qty
      const unit_cost = costEntry.unit_cost !== undefined ? costEntry.unit_cost : current.unit_cost
      updates.total_cost = qty * unit_cost
    }
  }

  const { data, error } = await supabase
    .from('cost_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update cost entry: ${error.message}`)
  }

  return data
}

/**
 * Delete a cost entry
 */
export async function deleteCostEntry(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cost_entries')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete cost entry: ${error.message}`)
  }
}

/**
 * Get cost rollup for a work order
 */
export async function getWorkOrderCostSummary(
  workOrderId: string
): Promise<WorkOrderCostSummary> {
  const supabase = await createClient()

  // Get all cost entries for this work order
  const { data: costEntries, error: costError } = await supabase
    .from('cost_entries')
    .select('bucket, total_cost')
    .eq('work_order_id', workOrderId)

  if (costError) {
    throw new Error(`Failed to get cost entries: ${costError.message}`)
  }

  // Group by bucket
  const rollupMap = new Map<CostBucket, number>()
  let grand_total = 0

  for (const entry of costEntries || []) {
    const current = rollupMap.get(entry.bucket) || 0
    rollupMap.set(entry.bucket, current + entry.total_cost)
    grand_total += entry.total_cost
  }

  const rollup: CostRollup[] = Array.from(rollupMap.entries()).map(([bucket, total]) => ({
    bucket,
    total,
  }))

  // Get work order to check for contract_total
  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('id')
    .eq('id', workOrderId)
    .single()

  let contract_total: number | undefined
  let estimated_margin: number | undefined

  if (workOrder) {
    // Get accepted quote for this work order
    const { data: quote } = await supabase
      .from('quotes')
      .select('total, status')
      .eq('work_order_id', workOrderId)
      .eq('status', 'Accepted')
      .single()

    if (quote) {
      contract_total = quote.total
      estimated_margin = contract_total - grand_total
    }
  }

  return {
    rollup,
    grand_total,
    contract_total,
    estimated_margin,
  }
}
