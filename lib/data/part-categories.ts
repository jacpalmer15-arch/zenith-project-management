'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { PartCategory, PartCategoryInsert, PartCategoryUpdate } from '@/lib/db'

/**
 * List all part categories
 */
export async function listPartCategories(): Promise<PartCategory[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('part_categories')
    .select('*')
    .order('sort_order')
  
  if (error) {
    throw new Error(`Failed to fetch part categories: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single part category by ID
 */
export async function getPartCategory(id: string): Promise<PartCategory> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('part_categories')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch part category: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Part category not found')
  }
  
  return data
}

/**
 * Create a new part category
 */
export async function createPartCategory(
  partCategory: PartCategoryInsert
): Promise<PartCategory> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('part_categories')
    .insert(partCategory)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create part category: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Part category not returned after creation')
  }
  
  return data
}

/**
 * Update a part category
 */
export async function updatePartCategory(
  id: string,
  updates: PartCategoryUpdate
): Promise<PartCategory> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('part_categories')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update part category: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Part category not found after update')
  }
  
  return data
}
