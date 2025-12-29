'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Location, LocationInsert, LocationUpdate, LocationWithCustomer } from '@/lib/db'

export interface ListLocationsOptions {
  customer_id?: string
  search?: string
  is_active?: boolean
}

/**
 * List all locations with optional filters
 */
export async function listLocations(
  options?: ListLocationsOptions
): Promise<LocationWithCustomer[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('locations')
    .select('*, customer:customers(*)')
    .order('created_at', { ascending: false })
  
  if (options?.customer_id) {
    query = query.eq('customer_id', options.customer_id)
  }

  if (options?.search) {
    query = query.or(
      `label.ilike.%${options.search}%,street.ilike.%${options.search}%,city.ilike.%${options.search}%,zip.ilike.%${options.search}%`
    )
  }

  if (options?.is_active !== undefined) {
    query = query.eq('is_active', options.is_active)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single location by ID
 */
export async function getLocation(id: string): Promise<LocationWithCustomer> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('locations')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch location: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Location not found')
  }
  
  return data as LocationWithCustomer
}

/**
 * Get locations by customer ID
 */
export async function getLocationsByCustomer(customerId: string): Promise<Location[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .order('label')
  
  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`)
  }
  
  return data || []
}

/**
 * Create a new location
 */
export async function createLocation(location: LocationInsert): Promise<Location> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('locations')
    .insert(location as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create location: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Location not returned after creation')
  }
  
  return data
}

/**
 * Update a location
 */
export async function updateLocation(
  id: string,
  updates: LocationUpdate
): Promise<Location> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('locations')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update location: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Location not found after update')
  }
  
  return data
}
