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
import { getTaxRule } from './tax-rules'

/**
 * Calculate line totals for a quote line
 */
function calculateLineTotals(
  qty: number,
  unit_price: number,
  is_taxable: boolean,
  tax_rate: number
): { line_subtotal: number; line_tax: number; line_total: number } {
  const line_subtotal = Math.round(qty * unit_price * 100) / 100
  const line_tax = is_taxable
    ? Math.round(line_subtotal * tax_rate * 100) / 100
    : 0
  const line_total = Math.round((line_subtotal + line_tax) * 100) / 100

  return { line_subtotal, line_tax, line_total }
}

export interface ListQuotesOptions {
  project_id?: string
  work_order_id?: string
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
  
  if (options?.work_order_id) {
    query = query.eq('work_order_id', options.work_order_id)
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
  
  return (data || []) as Quote[]
}

/**
 * Get a single quote by ID
 */
export async function getQuote(id: string): Promise<Quote> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quotes')
    .select(
      '*, project:projects(id, project_no, name, customer:customers(id, customer_no, name, email)), tax_rule:tax_rules(id, name, rate, is_active), parent_quote:quotes(id, quote_no)'
    )
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch quote: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote not found')
  }
  
  return data as Quote
}

/**
 * Create a new quote
 */
export async function createQuote(quote: QuoteInsert): Promise<Quote> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote as never)
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
  
  return data as Quote
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
    .update(updates as never)
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
  
  return data as Quote
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
  
  return (data || []) as QuoteLine[]
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
  
  return data as QuoteLine
}

/**
 * Create a new quote line
 */
export async function createQuoteLine(
  quoteLine: QuoteLineInsert
): Promise<QuoteLine> {
  const supabase = await createClient()

  // Get the quote to access the tax rule
  const quote = await getQuote(quoteLine.quote_id)
  const taxRule = await getTaxRule(quote.tax_rule_id)

  // Calculate line totals
  const { line_subtotal, line_tax, line_total } = calculateLineTotals(
    Number(quoteLine.qty),
    Number(quoteLine.unit_price),
    quoteLine.is_taxable ?? true,
    Number(taxRule.rate)
  )

  const { data, error } = await supabase
    .from('quote_lines')
    .insert({
      ...quoteLine,
      line_subtotal,
      line_tax,
      line_total,
    } as never)
    .select('*, part:parts(id, sku, name, uom)')
    .single()
  
  if (error) {
    throw new Error(`Failed to create quote line: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote line not returned after creation')
  }
  
  return data as QuoteLine
}

/**
 * Update a quote line
 */
export async function updateQuoteLine(
  id: string,
  updates: QuoteLineUpdate
): Promise<QuoteLine> {
  const supabase = await createClient()

  // Get the current quote line to access quote_id
  const currentLine = await getQuoteLine(id)
  const quote = await getQuote(currentLine.quote_id)
  const taxRule = await getTaxRule(quote.tax_rule_id)

  // Calculate line totals if relevant fields are being updated
  let lineUpdates = { ...updates }
  if ('qty' in updates || 'unit_price' in updates || 'is_taxable' in updates) {
    const qty = Number(updates.qty ?? currentLine.qty)
    const unit_price = Number(updates.unit_price ?? currentLine.unit_price)
    const is_taxable = updates.is_taxable ?? currentLine.is_taxable

    const { line_subtotal, line_tax, line_total } = calculateLineTotals(
      qty,
      unit_price,
      is_taxable,
      Number(taxRule.rate)
    )

    lineUpdates = {
      ...lineUpdates,
      line_subtotal,
      line_tax,
      line_total,
    }
  }

  const { data, error } = await supabase
    .from('quote_lines')
    .update(lineUpdates as never)
    .eq('id', id)
    .select('*, part:parts(id, sku, name, uom)')
    .single()
  
  if (error) {
    throw new Error(`Failed to update quote line: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Quote line not found after update')
  }
  
  return data as QuoteLine
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

/**
 * Recalculate and update quote totals based on all quote lines
 */
export async function recalculateQuoteTotals(quote_id: string): Promise<void> {
  const supabase = await createClient()

  // Get all quote lines
  const lines = await listQuoteLines(quote_id)

  // Calculate totals from lines
  const subtotal = lines.reduce(
    (sum, line) => sum + (Number(line.line_subtotal) || 0),
    0
  )
  const tax_total = lines.reduce(
    (sum, line) => sum + (Number(line.line_tax) || 0),
    0
  )
  const total_amount = Math.round((subtotal + tax_total) * 100) / 100

  // Update quote with calculated totals
  const { error } = await supabase
    .from('quotes')
    .update({
      subtotal: Math.round(subtotal * 100) / 100,
      tax_total: Math.round(tax_total * 100) / 100,
      total_amount,
    } as never)
    .eq('id', quote_id)

  if (error) {
    throw new Error(`Failed to update quote totals: ${error.message}`)
  }
}

/**
 * Get the accepted quote for a work order
 */
export async function getAcceptedQuoteForWorkOrder(
  workOrderId: string
): Promise<Quote | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quotes')
    .select(
      '*, project:projects(id, project_no, name, customer:customers(id, customer_no, name)), tax_rule:tax_rules(id, name, rate, is_active)'
    )
    .eq('work_order_id', workOrderId)
    .eq('status', 'ACCEPTED')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch accepted quote: ${error.message}`)
  }

  return data as Quote
}
