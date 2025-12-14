'use server'

import { createClient } from '@/lib/supabase/serverClient'
import {
  Quote,
  QuoteInsert,
  QuoteUpdate,
  QuoteLine,
  QuoteLineInsert,
  QuoteLineUpdate,
  QuoteStatus,
  QuoteType,
} from '@/lib/db'

export interface ListQuotesOptions {
  project_id?: string
  status?: QuoteStatus
  quote_type?: QuoteType
}

/**
 * List all quotes with optional filters
 */
export async function listQuotes(options?: ListQuotesOptions): Promise<Quote[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('quotes')
    .select(
      '*, project:projects(id, project_no, name, customer:customers(id, customer_no, name)), tax_rule:tax_rules(id, name, rate, is_active), parent_quote:quotes(id, quote_no)'
    )
    .order('created_at', { ascending: false })
  
  if (options?.project_id) {
    query = query.eq('project_id', options.project_id)
  }
  
  if (options?.status) {
    query = query.eq('status', options.status)
  }
  
  if (options?.quote_type) {
    query = query.eq('quote_type', options.quote_type)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch quotes: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single quote by ID
 */
export async function getQuote(id: string): Promise<Quote> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quotes')
    .select(
      '*, project:projects(id, project_no, name, customer:customers(id, customer_no, name)), tax_rule:tax_rules(id, name, rate, is_active), parent_quote:quotes(id, quote_no)'
    )
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch quote: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote not found')
  }
  
  return data
}

/**
 * Create a new quote
 */
export async function createQuote(quote: QuoteInsert): Promise<Quote> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select(
      '*, project:projects(id, project_no, name, customer:customers(id, customer_no, name)), tax_rule:tax_rules(id, name, rate, is_active), parent_quote:quotes(id, quote_no)'
    )
    .single()
  
  if (error) {
    throw new Error(`Failed to create quote: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote not returned after creation')
  }
  
  return data
}

/**
 * Update a quote
 */
export async function updateQuote(
  id: string,
  updates: QuoteUpdate
): Promise<Quote> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', id)
    .select(
      '*, project:projects(id, project_no, name, customer:customers(id, customer_no, name)), tax_rule:tax_rules(id, name, rate, is_active), parent_quote:quotes(id, quote_no)'
    )
    .single()
  
  if (error) {
    throw new Error(`Failed to update quote: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote not found after update')
  }
  
  return data
}

// ============================================================================
// Quote Lines CRUD
// ============================================================================

/**
 * List all quote lines for a quote
 */
export async function listQuoteLines(quote_id: string): Promise<QuoteLine[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quote_lines')
    .select('*, part:parts(id, sku, name, uom)')
    .eq('quote_id', quote_id)
    .order('line_no')
  
  if (error) {
    throw new Error(`Failed to fetch quote lines: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single quote line by ID
 */
export async function getQuoteLine(id: string): Promise<QuoteLine> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quote_lines')
    .select('*, part:parts(id, sku, name, uom)')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch quote line: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote line not found')
  }
  
  return data
}

/**
 * Create a new quote line
 */
export async function createQuoteLine(
  quoteLine: QuoteLineInsert
): Promise<QuoteLine> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quote_lines')
    .insert(quoteLine)
    .select('*, part:parts(id, sku, name, uom)')
    .single()
  
  if (error) {
    throw new Error(`Failed to create quote line: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote line not returned after creation')
  }
  
  return data
}

/**
 * Update a quote line
 */
export async function updateQuoteLine(
  id: string,
  updates: QuoteLineUpdate
): Promise<QuoteLine> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quote_lines')
    .update(updates)
    .eq('id', id)
    .select('*, part:parts(id, sku, name, uom)')
    .single()
  
  if (error) {
    throw new Error(`Failed to update quote line: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote line not found after update')
  }
  
  return data
}

/**
 * Delete a quote line
 */
export async function deleteQuoteLine(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('quote_lines')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete quote line: ${error.message}`)
  }
}
