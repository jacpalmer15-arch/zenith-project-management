'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Receipt, ReceiptInsert, ReceiptUpdate } from '@/lib/db'

export interface ListReceiptsOptions {
  is_allocated?: boolean
}

/**
 * List all receipts with optional filters
 */
export async function listReceipts(
  options?: ListReceiptsOptions
): Promise<any[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (options?.is_allocated !== undefined) {
    query = query.eq('is_allocated', options.is_allocated)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list receipts: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single receipt by ID
 */
export async function getReceipt(id: string): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get receipt: ${error.message}`)
  }

  return data
}

/**
 * Create a new receipt
 */
export async function createReceipt(receipt: ReceiptInsert): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('receipts')
    .insert(receipt as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create receipt: ${error.message}`)
  }

  return data
}

/**
 * Update an existing receipt
 */
export async function updateReceipt(
  id: string,
  receipt: ReceiptUpdate
): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('receipts') as any)
    .update(receipt)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update receipt: ${error.message}`)
  }

  return data
}

/**
 * Allocate a receipt to a work order or overhead bucket
 */
export async function allocateReceipt(
  id: string,
  allocation: {
    allocated_to_work_order_id?: string | null
    allocated_overhead_bucket?: string | null
  }
): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('receipts') as any)
    .update({
      is_allocated: true,
      ...allocation,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to allocate receipt: ${error.message}`)
  }

  return data
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete receipt: ${error.message}`)
  }
}
