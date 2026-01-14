'use server'
import { createClient } from '@/lib/supabase/serverClient'
import { ValidationError, ConflictError } from '@/lib/errors'

/**
 * Validate quote has exactly one parent (project OR work_order, not both, not neither)
 */
export async function validateQuoteParent(
  quoteData: { project_id?: string | null; work_order_id?: string | null }
): Promise<void> {
  const hasProject = !!quoteData.project_id
  const hasWorkOrder = !!quoteData.work_order_id
  
  if (!hasProject) {
    throw new ValidationError([
      'Quote must be linked to a Project'
    ])
  }

  if (hasWorkOrder) {
    // TODO(schema): allow quotes to reference work orders directly (nullable project_id or relaxed check constraint).
    throw new ValidationError([
      'Quote cannot be linked to a work order with the current schema'
    ])
  }
}

/**
 * Validate work order has a location
 */
export async function validateWorkOrderLocation(
  workOrderData: { location_id?: string | null }
): Promise<void> {
  // TODO(schema): allow nullable work_orders.location_id to support customer-level job sites.
  if (!workOrderData.location_id) {
    throw new ValidationError([
      'Work Order must have a service location'
    ])
  }
}

/**
 * Validate cost entry can be modified (not on closed work order unless admin)
 */
export async function validateCostEntryMutable(
  costEntry: { work_order_id: string },
  userRole: string,
  adminReason?: string
): Promise<void> {
  const supabase = await createClient()
  
  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('id, status, work_order_no')
    .eq('id', costEntry.work_order_id)
    .single()
  
  if (!workOrder) {
    throw new ValidationError(['Work order not found'])
  }
  
  if ((workOrder as any).status === 'CLOSED') {
    if (userRole !== 'ADMIN') {
      throw new ConflictError(
        `Cannot modify costs on closed work order ${(workOrder as any).work_order_no}`
      )
    }
    
    if (!adminReason) {
      throw new ValidationError([
        'Admin must provide a reason to modify costs on closed work orders'
      ])
    }
    
    // Log admin override
    console.log('[Admin Override] Cost entry modified on closed WO', {
      workOrderId: (workOrder as any).id,
      workOrderNo: (workOrder as any).work_order_no,
      reason: adminReason
    })
  }
}

/**
 * Validate time entry can be modified (not on closed work order)
 */
export async function validateTimeEntryMutable(
  timeEntry: { work_order_id: string },
  userRole: string
): Promise<void> {
  const supabase = await createClient()
  
  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('id, status, work_order_no')
    .eq('id', timeEntry.work_order_id)
    .single()
  
  if (!workOrder) {
    throw new ValidationError(['Work order not found'])
  }
  
  if ((workOrder as any).status === 'CLOSED') {
    if (userRole !== 'ADMIN') {
      throw new ConflictError(
        `Cannot modify time entries on closed work order ${(workOrder as any).work_order_no}`
      )
    }
  }
}

/**
 * Run all consistency checks for a work order
 */
export async function validateWorkOrderConsistency(
  workOrderId: string
): Promise<{ valid: boolean; issues: string[] }> {
  const supabase = await createClient()
  const issues: string[] = []
  
  const { data: workOrder } = await supabase
    .from('work_orders')
    .select(`
      *,
      location:locations(*),
      customer:customers(*),
      quotes(*),
      time_entries:work_order_time_entries(*),
      cost_entries:job_cost_entries(*)
    `)
    .eq('id', workOrderId)
    .single()
  
  if (!workOrder) {
    return { valid: false, issues: ['Work order not found'] }
  }
  
  const wo = workOrder as any
  
  // Check location
  if (!wo.location_id) {
    issues.push('Missing service location')
  }
  
  // Check customer
  if (!wo.customer_id) {
    issues.push('Missing customer')
  }
  
  // Check quotes have proper parent
  for (const quote of wo.quotes || []) {
    if (quote.project_id && quote.work_order_id) {
      issues.push(`Quote ${quote.quote_no} linked to both project and work order`)
    }
  }
  
  // Check for orphaned time entries (no clock out on completed/closed WO)
  if (['COMPLETED', 'CLOSED'].includes(wo.status)) {
    const openTimeEntries = (wo.time_entries || []).filter(
      (te: any) => !te.clock_out
    )
    if (openTimeEntries.length > 0) {
      issues.push(`${openTimeEntries.length} time entries missing clock out`)
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}
