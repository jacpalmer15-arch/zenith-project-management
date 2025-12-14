'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { CostType, CostTypeInsert, CostTypeUpdate } from '@/lib/db'

/**
 * List all cost types
 */
export async function listCostTypes(): Promise<CostType[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cost_types')
    .select('*')
    .order('sort_order')
  
  if (error) {
    throw new Error(`Failed to fetch cost types: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single cost type by ID
 */
export async function getCostType(id: string): Promise<CostType> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cost_types')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch cost type: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Cost type not found')
  }
  
  return data
}

/**
 * Create a new cost type
 */
export async function createCostType(costType: CostTypeInsert): Promise<CostType> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cost_types')
    .insert(costType as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create cost type: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Cost type not returned after creation')
  }
  
  return data
}

/**
 * Update a cost type
 */
export async function updateCostType(
  id: string,
  updates: CostTypeUpdate
): Promise<CostType> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cost_types')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update cost type: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Cost type not found after update')
  }
  
  return data
}
