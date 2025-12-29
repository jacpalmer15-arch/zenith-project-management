'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { InventoryLedger, InventoryLedgerInsert, Part } from '@/lib/db'

export interface ListInventoryTransactionsOptions {
  part_id?: string
  txn_type?: 'RECEIPT' | 'USAGE' | 'ADJUSTMENT' | 'RETURN'
}

export interface PartWithOnHand extends Part {
  on_hand_qty: number
}

/**
 * List all inventory transactions with optional filters
 */
export async function listInventoryTransactions(
  options?: ListInventoryTransactionsOptions
): Promise<InventoryLedger[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('inventory_ledger')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (options?.part_id) {
    query = query.eq('part_id', options.part_id)
  }

  if (options?.txn_type) {
    query = query.eq('txn_type', options.txn_type)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list inventory transactions: ${error.message}`)
  }

  return data || []
}

/**
 * Create a new inventory transaction
 */
export async function createInventoryTransaction(
  transaction: InventoryLedgerInsert
): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('inventory_ledger') as any)
    .insert(transaction)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create inventory transaction: ${error.message}`)
  }

  return data
}

/**
 * Get on-hand quantity for a specific part
 */
export async function getPartOnHandQty(partId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_ledger')
    .select('txn_type, qty_delta')
    .eq('part_id', partId)

  if (error) {
    throw new Error(`Failed to get inventory transactions: ${error.message}`)
  }

  let onHand = 0
  for (const txn of data || []) {
    onHand += (txn as any).qty_delta
  }

  return onHand
}

/**
 * Get on-hand quantities for all parts
 */
export async function getAllPartsWithOnHand(): Promise<Map<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_ledger')
    .select('part_id, qty_delta')

  if (error) {
    throw new Error(`Failed to get inventory transactions: ${error.message}`)
  }

  const onHandMap = new Map<string, number>()

  for (const txn of data || []) {
    const current = onHandMap.get((txn as any).part_id) || 0
    onHandMap.set((txn as any).part_id, current + (txn as any).qty_delta)
  }

  return onHandMap
}

/**
 * List parts with on-hand quantities
 */
export async function listPartsWithOnHand(): Promise<PartWithOnHand[]> {
  const supabase = await createClient()

  // Get all parts
  const { data: parts, error: partsError } = await supabase
    .from('parts')
    .select('*')
    .order('sku', { ascending: true })

  if (partsError) {
    throw new Error(`Failed to get parts: ${partsError.message}`)
  }

  // Get on-hand quantities
  const onHandMap = await getAllPartsWithOnHand()

  // Combine
  return (parts || []).map((part) => ({
    ...(part as any),
    on_hand_qty: onHandMap.get((part as any).id) || 0,
  }))
}
