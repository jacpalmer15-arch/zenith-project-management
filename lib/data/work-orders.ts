'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { WorkOrder, WorkOrderInsert, WorkOrderUpdate, WorkOrderWithCustomerLocation, WorkStatus } from '@/lib/db'

export interface ListWorkOrdersOptions {
  status?: WorkStatus
  priority?: number
  assigned_to?: string
  customer_id?: string
  search?: string
  start_date?: string
  end_date?: string
}

/**
 * List all work orders with optional filters
 */
export async function listWorkOrders(
  options?: ListWorkOrdersOptions
): Promise<WorkOrderWithCustomerLocation[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers(*),
      location:locations(*),
      assigned_employee:employees(*)
    `)
    .order('updated_at', { ascending: false })
  
  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.priority) {
    query = query.eq('priority', options.priority)
  }

  if (options?.assigned_to) {
    query = query.eq('assigned_to', options.assigned_to)
  }

  if (options?.customer_id) {
    query = query.eq('customer_id', options.customer_id)
  }

  if (options?.search) {
    query = query.or(
      `work_order_no.ilike.%${options.search}%,summary.ilike.%${options.search}%,description.ilike.%${options.search}%`
    )
  }

  if (options?.start_date) {
    query = query.gte('opened_at', options.start_date)
  }

  if (options?.end_date) {
    query = query.lte('opened_at', options.end_date)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch work orders: ${error.message}`)
  }
  
  return data as WorkOrderWithCustomerLocation[] || []
}

/**
 * Get a single work order by ID
 */
export async function getWorkOrder(id: string): Promise<WorkOrderWithCustomerLocation> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers(*),
      location:locations(*),
      assigned_employee:employees(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch work order: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Work order not found')
  }
  
  return data as WorkOrderWithCustomerLocation
}

/**
 * Create a new work order
 */
export async function createWorkOrder(workOrder: WorkOrderInsert): Promise<WorkOrder> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_orders')
    .insert(workOrder as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create work order: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Work order not returned after creation')
  }
  
  return data
}

/**
 * Update a work order
 */
export async function updateWorkOrder(
  id: string,
  updates: WorkOrderUpdate
): Promise<WorkOrder> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_orders')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update work order: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Work order not found after update')
  }
  
  return data
}

/**
 * Delete a work order
 */
export async function deleteWorkOrder(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('work_orders')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete work order: ${error.message}`)
  }
}
