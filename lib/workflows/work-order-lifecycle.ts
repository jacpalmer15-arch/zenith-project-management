'use server'

import { getWorkOrder, updateWorkOrder } from '@/lib/data/work-orders'
import { 
  InvalidTransitionError, 
  ValidationError,
  MissingDataError
} from '@/lib/errors'
import { 
  WorkOrderStatus, 
  TransitionResult,
  ALLOWED_TRANSITIONS 
} from './transitions'

/**
 * Transition a work order from one status to another
 * 
 * Note: getWorkOrder() throws an error if the work order is not found,
 * so we don't need to check for null here.
 */
export async function transitionWorkOrder(
  id: string,
  to: WorkOrderStatus,
  reason?: string
): Promise<TransitionResult> {
  const wo = await getWorkOrder(id)
  
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === wo.status && t.to === to
  )
  
  if (!transition) {
    throw new InvalidTransitionError(wo.status, to)
  }
  
  if (transition.requiresReason && !reason) {
    throw new MissingDataError('Transition', 'reason', 'A reason is required for this status change')
  }
  
  const issues = transition.validate(wo)
  if (issues.length > 0) {
    throw new ValidationError(issues)
  }
  
  const updates: Record<string, any> = { status: to }
  if (to === 'COMPLETED') {
    updates.completed_at = new Date().toISOString()
  }
  if (to === 'CLOSED') {
    updates.closed_at = new Date().toISOString()
  }
  await updateWorkOrder(id, updates)
  
  return {
    workOrderId: id,
    from: wo.status,
    to,
    timestamp: new Date(),
    reason
  }
}
