'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Part, PartInsert, PartUpdate } from '@/lib/db'

export interface ListPartsOptions {
  category_id?: string
  is_active?: boolean
  search?: string
}

/**
 * List all parts with optional filters
 */
export async function listParts(options?: ListPartsOptions): Promise<Part[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('parts')
    .select(
      '*, category:part_categories(id, name, sort_order), cost_type:cost_types(id, name, sort_order), cost_code:cost_codes(id, code, name, cost_type_id)'
    )
    .order('name')
  
  if (options?.category_id) {
    query = query.eq('category_id', options.category_id)
  }
  
  if (options?.is_active !== undefined) {
    query = query.eq('is_active', options.is_active)
  }
  
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,sku.ilike.%${options.search}%,description_default.ilike.%${options.search}%`
    )
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch parts: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single part by ID
 */
export async function getPart(id: string): Promise<Part> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('parts')
    .select(
      '*, category:part_categories(id, name, sort_order), cost_type:cost_types(id, name, sort_order), cost_code:cost_codes(id, code, name, cost_type_id)'
    )
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch part: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Part not found')
  }
  
  return data
}

/**
 * Create a new part
 */
export async function createPart(part: PartInsert): Promise<Part> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('parts')
    .insert(part)
    .select(
      '*, category:part_categories(id, name, sort_order), cost_type:cost_types(id, name, sort_order), cost_code:cost_codes(id, code, name, cost_type_id)'
    )
    .single()
  
  if (error) {
    throw new Error(`Failed to create part: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Part not returned after creation')
  }
  
  return data
}

/**
 * Update a part
 */
export async function updatePart(
  id: string,
  updates: PartUpdate
): Promise<Part> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('parts')
    .update(updates)
    .eq('id', id)
    .select(
      '*, category:part_categories(id, name, sort_order), cost_type:cost_types(id, name, sort_order), cost_code:cost_codes(id, code, name, cost_type_id)'
    )
    .single()
  
  if (error) {
    throw new Error(`Failed to update part: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Part not found after update')
  }
  
  return data
}
