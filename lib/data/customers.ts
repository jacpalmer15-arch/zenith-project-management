'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Customer, CustomerInsert, CustomerUpdate } from '@/lib/db'

export interface ListCustomersOptions {
  search?: string
}

export interface ListCustomersWithCountOptions extends ListCustomersOptions {
  has_email?: boolean
  has_phone?: boolean
  sort?: 'name' | 'customer_no' | 'created_at'
  sort_direction?: 'asc' | 'desc'
  limit?: number
  offset?: number
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
 * List customers with pagination + count
 */
export async function listCustomersWithCount(
  options?: ListCustomersWithCountOptions
): Promise<{ data: Customer[]; count: number }> {
  const supabase = await createClient()

  const sortColumn = options?.sort || 'name'
  const sortDirection = options?.sort_direction || 'asc'

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order(sortColumn, { ascending: sortDirection === 'asc' })

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,customer_no.ilike.%${options.search}%,contact_name.ilike.%${options.search}%`
    )
  }

  if (options?.has_email) {
    query = query.not('email', 'is', null).neq('email', '')
  }

  if (options?.has_phone) {
    query = query.not('phone', 'is', null).neq('phone', '')
  }

  if (options?.limit) {
    const start = options.offset || 0
    query = query.range(start, start + options.limit - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  return {
    data: data || [],
    count: count || 0,
  }
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
