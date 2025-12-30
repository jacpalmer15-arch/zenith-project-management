'use server'

import { getWorkOrder, updateWorkOrder } from '@/lib/data/work-orders'
import { InvalidTransitionError, ValidationError } from './errors'
import { 
  WorkOrderStatus, 
  TransitionResult,
  ALLOWED_TRANSITIONS 
} from './transitions'

/**
 * Transition a work order from one status to another
 */
export async function transitionWorkOrder(
  id: string,
  to: WorkOrderStatus,
  reason?: string
): Promise<TransitionResult> {
  let wo
  try {
    wo = await getWorkOrder(id)
  } catch (error) {
    throw new InvalidTransitionError(
      `Failed to fetch work order: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  if (!wo) {
    throw new InvalidTransitionError('Work order not found')
  }
  
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === wo.status && t.to === to
  )
  
  if (!transition) {
    throw new InvalidTransitionError(
      `Cannot transition from ${wo.status} to ${to}`
    )
  }
  
  if (transition.requiresReason && !reason) {
    throw new ValidationError('Reason required for this transition')
  }
  
  const issues = transition.validate(wo)
  if (issues.length > 0) {
    throw new ValidationError(`Cannot transition: ${issues.join(', ')}`, issues)
  }
  
  await updateWorkOrder(id, { status: to })
  
  // Log transition for now (no audit table yet per discussion)
  const result: TransitionResult = {
    workOrderId: id,
    from: wo.status,
    to,
    timestamp: new Date(),
    reason
  }
  
  console.log('Work order transition:', result)
  
  return result
}

