'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Receipt, ReceiptInsert, ReceiptUpdate } from '@/lib/db'

export interface ListReceiptsOptions {
  is_allocated?: boolean
  work_order_id?: string
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

  if (options?.work_order_id) {
    query = query.eq('allocated_to_work_order_id', options.work_order_id)
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

/**
 * Receipt with age information
 */
export interface ReceiptWithAge extends Receipt {
  age_days: number
}

/**
 * Find potential duplicate receipts
 */
export async function findDuplicateReceipts(
  receiptId?: string
): Promise<Receipt[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('receipts')
    .select('*')
    .eq('is_allocated', false)
  
  if (receiptId) {
    const receipt = await getReceipt(receiptId)
    
    // Find receipts with same vendor, date, and amount
    query = supabase
      .from('receipts')
      .select('*')
      .eq('vendor_name', receipt.vendor_name)
      .eq('receipt_date', receipt.receipt_date)
      .eq('total_amount', receipt.total_amount)
      .not('id', 'eq', receiptId)
  } else {
    // Find all potential duplicates using SQL
    const { data, error } = await supabase.rpc('find_duplicate_receipts')
    if (error) {
      // If RPC doesn't exist, return empty array
      console.warn('find_duplicate_receipts RPC not available:', error.message)
      return []
    }
    return data || []
  }
  
  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to find duplicate receipts: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get aged receipts (unallocated receipts older than specified days)
 */
export async function getAgedReceipts(
  daysOld: number = 7
): Promise<ReceiptWithAge[]> {
  const supabase = await createClient()
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('is_allocated', false)
    .lt('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to get aged receipts: ${error.message}`)
  }
  
  return (data || []).map((receipt: any) => ({
    ...receipt,
    age_days: Math.floor(
      (new Date().getTime() - new Date(receipt.created_at).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
  }))
}
