'use server'

import { createClient } from '@/lib/supabase/serverClient'

/**
 * Get the next number for a given entity type (customer, project, quote, or work_order)
 * This calls the database function that atomically increments and returns the next number
 */
export async function getNextNumber(kind: 'customer' | 'project' | 'quote' | 'work_order'): Promise<string> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_next_number', {
    p_kind: kind,
  } as never)
  
  if (error) {
    throw new Error(`Failed to get next ${kind} number: ${error.message}`)
  }
  
  if (!data) {
    throw new Error(`No number returned for ${kind}`)
  }
  
  return data
}

/**
 * Accept a quote - marks it as accepted and updates the accepted_at timestamp
 * This calls the database function that handles all the quote acceptance logic
 */
export async function acceptQuote(quote_id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('accept_quote', {
    p_quote_id: quote_id,
  } as never)
  
  if (error) {
    throw new Error(`Failed to accept quote: ${error.message}`)
  }
}
