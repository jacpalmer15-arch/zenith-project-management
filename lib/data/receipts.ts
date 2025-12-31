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

/**
 * List line items for a receipt
 */
export async function listReceiptLineItems(receiptId: string): Promise<any[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('receipt_line_items')
    .select('*, part:parts(id, sku, name)')
    .eq('receipt_id', receiptId)
    .order('line_no', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to list receipt line items: ${error.message}`)
  }
  
  return (data || []) as any[]
}

/**
 * Get a single line item by ID
 */
export async function getReceiptLineItem(id: string): Promise<any> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('receipt_line_items')
    .select('*, part:parts(id, sku, name)')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to get receipt line item: ${error.message}`)
  }
  
  return data as any
}

/**
 * Create a receipt line item
 */
export async function createReceiptLineItem(lineItem: any): Promise<any> {
  const supabase = await createClient()
  
  // Calculate amount
  const amount = (lineItem.qty || 0) * (lineItem.unit_cost || 0)
  
  const { data, error } = await supabase
    .from('receipt_line_items')
    .insert({
      ...lineItem,
      amount,
    } as any)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create receipt line item: ${error.message}`)
  }
  
  return data as any
}

/**
 * Update a receipt line item
 */
export async function updateReceiptLineItem(
  id: string, 
  updates: any
): Promise<any> {
  const supabase = await createClient()
  
  // Recalculate amount if qty or unit_cost changed
  let updateData: any = { ...updates }
  if (updates.qty !== undefined || updates.unit_cost !== undefined) {
    const current = await getReceiptLineItem(id)
    const qty = updates.qty !== undefined ? updates.qty : current.qty
    const unit_cost = updates.unit_cost !== undefined ? updates.unit_cost : current.unit_cost
    updateData.amount = qty * unit_cost
  }
  
  const { data, error } = await (supabase
    .from('receipt_line_items') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update receipt line item: ${error.message}`)
  }
  
  return data as any
}

/**
 * Delete a receipt line item
 */
export async function deleteReceiptLineItem(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('receipt_line_items')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete receipt line item: ${error.message}`)
  }
}

/**
 * Get next line number for a receipt
 */
export async function getNextLineNumber(receiptId: string): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('receipt_line_items')
    .select('line_no')
    .eq('receipt_id', receiptId)
    .order('line_no', { ascending: false })
    .limit(1)
  
  if (error) {
    throw new Error(`Failed to get next line number: ${error.message}`)
  }
  
  return data && data.length > 0 ? (data[0] as any).line_no + 1 : 1
}
