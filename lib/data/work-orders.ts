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
  work_order_ids?: string[]
  sort?: 'updated_at' | 'opened_at' | 'priority'
  sort_direction?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * List all work orders with optional filters
 */
export async function listWorkOrders(
  options?: ListWorkOrdersOptions
): Promise<WorkOrderWithCustomerLocation[]> {
  const supabase = await createClient()
  
  const sortColumn = options?.sort || 'updated_at'
  const sortDirection = options?.sort_direction || 'desc'

  let query = supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers(*),
      location:locations(*),
      assigned_employee:employees(*)
    `)
    .order(sortColumn, { ascending: sortDirection === 'asc' })

  if (options?.work_order_ids) {
    if (options.work_order_ids.length === 0) {
      return []
    }
    query = query.in('id', options.work_order_ids)
  }
  
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

  if (options?.limit) {
    const start = options.offset || 0
    query = query.range(start, start + options.limit - 1)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch work orders: ${error.message}`)
  }
  
  return data as WorkOrderWithCustomerLocation[] || []
}

/**
 * List work orders with pagination + count
 */
export async function listWorkOrdersWithCount(
  options?: ListWorkOrdersOptions
): Promise<{ data: WorkOrderWithCustomerLocation[]; count: number }> {
  const supabase = await createClient()

  const sortColumn = options?.sort || 'updated_at'
  const sortDirection = options?.sort_direction || 'desc'

  let query = supabase
    .from('work_orders')
    .select(
      `
        *,
        customer:customers(*),
        location:locations(*),
        assigned_employee:employees(*)
      `,
      { count: 'exact' }
    )
    .order(sortColumn, { ascending: sortDirection === 'asc' })

  if (options?.work_order_ids) {
    if (options.work_order_ids.length === 0) {
      return { data: [], count: 0 }
    }
    query = query.in('id', options.work_order_ids)
  }

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

  if (options?.limit) {
    const start = options.offset || 0
    query = query.range(start, start + options.limit - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch work orders: ${error.message}`)
  }

  return {
    data: (data as WorkOrderWithCustomerLocation[]) || [],
    count: count || 0,
  }
}

/**
 * Get work order IDs assigned to a technician (direct or scheduled)
 */
export async function listWorkOrderIdsForTech(
  techUserId: string
): Promise<string[]> {
  const supabase = await createClient()

  const [{ data: assigned }, { data: scheduled }] = await Promise.all([
    supabase
      .from('work_orders')
      .select('id')
      .eq('assigned_to', techUserId),
    supabase
      .from('work_order_schedule')
      .select('work_order_id')
      .eq('tech_user_id', techUserId),
  ])

  const ids = new Set<string>()
  assigned?.forEach((row: any) => ids.add(row.id))
  scheduled?.forEach((row: any) => ids.add(row.work_order_id))

  return Array.from(ids)
}

/**
 * Check if a technician is assigned to a work order
 */
export async function isTechAssignedToWorkOrder(
  workOrderId: string,
  techUserId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('assigned_to')
    .eq('id', workOrderId)
    .single()

  if (workOrder?.assigned_to === techUserId) {
    return true
  }

  const { data: scheduled } = await supabase
    .from('work_order_schedule')
    .select('id')
    .eq('work_order_id', workOrderId)
    .eq('tech_user_id', techUserId)
    .limit(1)

  return (scheduled || []).length > 0
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
