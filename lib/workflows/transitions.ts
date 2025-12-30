import { WorkStatus } from '@/lib/db'
import { WorkOrder } from '@/lib/db'

export type WorkOrderStatus = WorkStatus

export type WorkOrderTransition = {
  from: WorkOrderStatus
  to: WorkOrderStatus
  validate: (wo: WorkOrder) => string[]
  requiresReason?: boolean
}

export type TransitionResult = {
  workOrderId: string
  from: WorkOrderStatus
  to: WorkOrderStatus
  timestamp: Date
  reason?: string
}

export const ALLOWED_TRANSITIONS: WorkOrderTransition[] = [
  { 
    from: 'UNSCHEDULED', 
    to: 'SCHEDULED',
    validate: (wo) => {
      const issues: string[] = []
      if (!wo.assigned_to) issues.push('Must assign tech')
      return issues
    }
  },
  { 
    from: 'SCHEDULED', 
    to: 'IN_PROGRESS',
    validate: () => []
  },
  { 
    from: 'IN_PROGRESS', 
    to: 'COMPLETED',
    validate: () => []
  },
  { 
    from: 'COMPLETED', 
    to: 'CLOSED',
    validate: () => [], // Separate close-out gate
    requiresReason: true
  },
  {
    from: 'UNSCHEDULED',
    to: 'CANCELED',
    validate: () => [],
    requiresReason: true
  },
  {
    from: 'SCHEDULED',
    to: 'CANCELED',
    validate: () => [],
    requiresReason: true
  }
]

/**
 * Get allowed transitions for a given status
 */
export function getAllowedTransitions(
  currentStatus: WorkOrderStatus
): WorkOrderStatus[] {
  return ALLOWED_TRANSITIONS
    .filter(t => t.from === currentStatus)
    .map(t => t.to)
}

/**
 * Check if a transition requires a reason
 */
export function requiresReason(
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus
): boolean {
  const transition = ALLOWED_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === newStatus
  )
  return transition?.requiresReason || false
}
