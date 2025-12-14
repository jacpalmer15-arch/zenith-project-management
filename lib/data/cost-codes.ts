'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { CostCode, CostCodeInsert, CostCodeUpdate, CostType } from '@/lib/db'

export interface ListCostCodesOptions {
  cost_type_id?: string
}

export type CostCodeWithRelations = CostCode & {
  cost_type?: CostType | null
}

/**
 * List all cost codes with optional cost_type filter
 */
export async function listCostCodes(
  options?: ListCostCodesOptions
): Promise<CostCodeWithRelations[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('cost_codes')
    .select('*, cost_type:cost_types(id, name, sort_order)')
    .order('sort_order')
  
  if (options?.cost_type_id) {
    query = query.eq('cost_type_id', options.cost_type_id)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch cost codes: ${error.message}`)
  }
  
  return (data || []) as CostCodeWithRelations[]
}

/**
 * Get a single cost code by ID
 */
export async function getCostCode(id: string): Promise<CostCodeWithRelations> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cost_codes')
    .select('*, cost_type:cost_types(id, name, sort_order)')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch cost code: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Cost code not found')
  }
  
  return data as CostCodeWithRelations
}

/**
 * Create a new cost code
 */
export async function createCostCode(costCode: CostCodeInsert): Promise<CostCode> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cost_codes')
    .insert(costCode as never)
    .select('*, cost_type:cost_types(id, name, sort_order)')
    .single()
  
  if (error) {
    throw new Error(`Failed to create cost code: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Cost code not returned after creation')
  }
  
  return data as CostCode
}

/**
 * Update a cost code
 */
export async function updateCostCode(
  id: string,
  updates: CostCodeUpdate
): Promise<CostCode> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cost_codes')
    .update(updates as never)
    .eq('id', id)
    .select('*, cost_type:cost_types(id, name, sort_order)')
    .single()
  
  if (error) {
    throw new Error(`Failed to update cost code: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Cost code not found after update')
  }
  
  return data as CostCode
}
