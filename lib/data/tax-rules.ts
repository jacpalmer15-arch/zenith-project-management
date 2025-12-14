'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { TaxRule, TaxRuleInsert, TaxRuleUpdate } from '@/lib/db'

/**
 * List all tax rules
 */
export async function listTaxRules(): Promise<TaxRule[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tax_rules')
    .select('*')
    .order('name')
  
  if (error) {
    throw new Error(`Failed to fetch tax rules: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single tax rule by ID
 */
export async function getTaxRule(id: string): Promise<TaxRule> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tax_rules')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch tax rule: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Tax rule not found')
  }
  
  return data
}

/**
 * Create a new tax rule
 */
export async function createTaxRule(taxRule: TaxRuleInsert): Promise<TaxRule> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tax_rules')
    .insert(taxRule as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create tax rule: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Tax rule not returned after creation')
  }
  
  return data
}

/**
 * Update a tax rule
 */
export async function updateTaxRule(
  id: string,
  updates: TaxRuleUpdate
): Promise<TaxRule> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tax_rules')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update tax rule: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Tax rule not found after update')
  }
  
  return data
}
