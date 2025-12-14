'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Customer, CustomerInsert, CustomerUpdate } from '@/lib/db'

export interface ListCustomersOptions {
  search?: string
}

/**
 * List all customers with optional search
 */
export async function listCustomers(
  options?: ListCustomersOptions
): Promise<Customer[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('customers')
    .select('*')
    .order('name')
  
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,customer_no.ilike.%${options.search}%,contact_name.ilike.%${options.search}%`
    )
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single customer by ID
 */
export async function getCustomer(id: string): Promise<Customer> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch customer: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Customer not found')
  }
  
  return data
}

/**
 * Create a new customer
 */
export async function createCustomer(customer: CustomerInsert): Promise<Customer> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .insert(customer as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Customer not returned after creation')
  }
  
  return data
}

/**
 * Update a customer
 */
export async function updateCustomer(
  id: string,
  updates: CustomerUpdate
): Promise<Customer> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Customer not found after update')
  }
  
  return data
}
