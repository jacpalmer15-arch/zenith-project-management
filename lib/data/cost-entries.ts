'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { JobCostEntry, JobCostEntryInsert, JobCostEntryUpdate, JobCostEntryWithRelations } from '@/lib/db'

export interface ListJobCostEntriesOptions {
  project_id?: string
  work_order_id?: string
  cost_type_id?: string
  cost_code_id?: string
  start_date?: string
  end_date?: string
}

export interface CostRollup {
  cost_type_id: string
  cost_type_name: string
  total: number
}

export interface JobCostSummary {
  rollup: CostRollup[]
  grand_total: number
}

/**
 * List all job cost entries with optional filters
 */
export async function listJobCostEntries(
  options?: ListJobCostEntriesOptions
): Promise<any[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('job_cost_entries')
    .select(`
      *,
      project:projects(*, customer:customers(*)),
      work_order:work_orders(*, customer:customers(*)),
      part:parts(*),
      cost_type:cost_types(*),
      cost_code:cost_codes(*)
    `)
    .order('txn_date', { ascending: false })
  
  if (options?.project_id) {
    query = query.eq('project_id', options.project_id)
  }

  if (options?.work_order_id) {
    query = query.eq('work_order_id', options.work_order_id)
  }

  if (options?.cost_type_id) {
    query = query.eq('cost_type_id', options.cost_type_id)
  }

  if (options?.cost_code_id) {
    query = query.eq('cost_code_id', options.cost_code_id)
  }

  if (options?.start_date) {
    query = query.gte('txn_date', options.start_date)
  }

  if (options?.end_date) {
    query = query.lte('txn_date', options.end_date)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list job cost entries: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single job cost entry by ID
 */
export async function getJobCostEntry(id: string): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_cost_entries')
    .select(`
      *,
      project:projects(*, customer:customers(*)),
      work_order:work_orders(*, customer:customers(*)),
      part:parts(*),
      cost_type:cost_types(*),
      cost_code:cost_codes(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get job cost entry: ${error.message}`)
  }

  return data
}

/**
 * Create a new job cost entry
 */
export async function createJobCostEntry(costEntry: JobCostEntryInsert): Promise<any> {
  const supabase = await createClient()

  // Calculate amount from qty and unit_cost
  const amount = Math.round((costEntry.qty || 0) * (costEntry.unit_cost || 0) * 100) / 100

  const { data, error } = await supabase
    .from('job_cost_entries')
    .insert({
      ...costEntry,
      amount,
    } as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create job cost entry: ${error.message}`)
  }

  return data
}

/**
 * Update an existing job cost entry
 */
export async function updateJobCostEntry(
  id: string,
  costEntry: JobCostEntryUpdate
): Promise<any> {
  const supabase = await createClient()

  // Recalculate amount if qty or unit_cost changed
  const updates: any = { ...costEntry }
  if (costEntry.qty !== undefined || costEntry.unit_cost !== undefined) {
    // Fetch current values if not provided
    const { data: current } = await supabase
      .from('job_cost_entries')
      .select('qty, unit_cost')
      .eq('id', id)
      .single()

    if (current) {
      const qty = costEntry.qty !== undefined ? costEntry.qty : (current as any).qty
      const unit_cost = costEntry.unit_cost !== undefined ? costEntry.unit_cost : (current as any).unit_cost
      updates.amount = Math.round(qty * unit_cost * 100) / 100
    }
  }

  const { data, error } = await (supabase
    .from('job_cost_entries') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update job cost entry: ${error.message}`)
  }

  return data
}

/**
 * Delete a job cost entry
 */
export async function deleteJobCostEntry(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('job_cost_entries')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete job cost entry: ${error.message}`)
  }
}

/**
 * Get cost summary for a project or work order
 */
export async function getJobCostSummary(
  params: { project_id?: string; work_order_id?: string }
): Promise<JobCostSummary> {
  const supabase = await createClient()

  // Build query based on params
  let query = supabase
    .from('job_cost_entries')
    .select('cost_type_id, amount, cost_type:cost_types(name)')

  if (params.project_id) {
    query = query.eq('project_id', params.project_id)
  } else if (params.work_order_id) {
    query = query.eq('work_order_id', params.work_order_id)
  } else {
    throw new Error('Must provide either project_id or work_order_id')
  }

  const { data: costEntries, error: costError } = await query

  if (costError) {
    throw new Error(`Failed to get cost entries: ${costError.message}`)
  }

  // Group by cost type
  const rollupMap = new Map<string, { cost_type_id: string; cost_type_name: string; total: number }>()
  let grand_total = 0

  for (const entry of costEntries || []) {
    const cost_type_id = (entry as any).cost_type_id
    const cost_type_name = (entry as any).cost_type?.name || 'Unknown'
    const amount = (entry as any).amount

    const current = rollupMap.get(cost_type_id) || { cost_type_id, cost_type_name, total: 0 }
    current.total += amount
    rollupMap.set(cost_type_id, current)
    grand_total += amount
  }

  const rollup: CostRollup[] = Array.from(rollupMap.values()).map(({ cost_type_id, cost_type_name, total }) => ({
    cost_type_id,
    cost_type_name,
    total,
  }))

  return {
    rollup,
    grand_total,
  }
}

/**
 * List job cost entries for a specific receipt line item
 */
export async function listJobCostEntriesByLineItem(lineItemId: string): Promise<any[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_cost_entries')
    .select(`
      *,
      project:projects(id, name, project_no),
      work_order:work_orders(id, work_order_no, summary),
      cost_type:cost_types(id, name),
      cost_code:cost_codes(id, name)
    `)
    .eq('receipt_line_item_id', lineItemId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to list job cost entries by line item: ${error.message}`)
  }

  return data || []
}

/**
 * List job cost entries for an entire receipt
 */
export async function listJobCostEntriesByReceipt(receiptId: string): Promise<any[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_cost_entries')
    .select(`
      *,
      project:projects(id, name, project_no),
      work_order:work_orders(id, work_order_no, summary),
      cost_type:cost_types(id, name),
      cost_code:cost_codes(id, name)
    `)
    .eq('receipt_id', receiptId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to list job cost entries by receipt: ${error.message}`)
  }

  return data || []
}

/**
 * Validate allocation amount against unallocated total
 * Returns true if valid, throws error if invalid
 */
export async function validateAllocationAmount(
  lineItemId: string,
  amount: number
): Promise<{ valid: boolean; unallocated_total: number; error?: string }> {
  const supabase = await createClient()

  // Query the allocation status view
  const { data, error } = await supabase
    .from('vw_receipt_line_allocation_status')
    .select('unallocated_total, line_total')
    .eq('receipt_line_item_id', lineItemId)
    .single()

  if (error) {
    throw new Error(`Failed to validate allocation amount: ${error.message}`)
  }

  if (!data) {
    throw new Error('Line item not found')
  }

  const unallocated = parseFloat((data as any).unallocated_total || '0')

  // Check if amount exceeds unallocated total
  if (amount > unallocated) {
    return {
      valid: false,
      unallocated_total: unallocated,
      error: `Cannot allocate $${amount.toFixed(2)}. Only $${unallocated.toFixed(2)} remaining.`
    }
  }

  return {
    valid: true,
    unallocated_total: unallocated
  }
}
