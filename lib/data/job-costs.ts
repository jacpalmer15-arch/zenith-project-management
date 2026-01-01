'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { JobCostEntry, JobCostEntryInsert, JobCostEntryUpdate } from '@/lib/db'

export interface ListJobCostEntriesByLineItemOptions {
  receipt_line_item_id: string
}

export interface ListJobCostEntriesByReceiptOptions {
  receipt_id: string
}

/**
 * Create a new job cost entry
 */
export async function createJobCostEntry(costEntry: JobCostEntryInsert): Promise<JobCostEntry> {
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

  return data as JobCostEntry
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

  const unallocated = parseFloat(data.unallocated_total || '0')

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
