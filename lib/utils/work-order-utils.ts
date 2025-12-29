import { WorkStatus } from '@/lib/db'

/**
 * Validate status transition for work orders
 */
export function canTransitionStatus(currentStatus: WorkStatus, newStatus: WorkStatus): { allowed: boolean; message?: string } {
  const transitions: Record<WorkStatus, WorkStatus[]> = {
    'UNSCHEDULED': ['SCHEDULED', 'CANCELED'],
    'SCHEDULED': ['IN_PROGRESS', 'CANCELED'],
    'IN_PROGRESS': ['COMPLETED', 'CANCELED'],
    'COMPLETED': ['CLOSED'],
    'CLOSED': [],
    'CANCELED': [],
  }

  if (currentStatus === newStatus) {
    return { allowed: true }
  }

  const allowedTransitions = transitions[currentStatus] || []
  
  if (allowedTransitions.includes(newStatus)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    message: `Cannot transition from ${currentStatus} to ${newStatus}`
  }
}

/**
 * Calculate hours worked from time entry
 */
export function calculateHours(clockIn: string, clockOut: string | null, breakMinutes: number = 0): number {
  if (!clockOut) return 0
  
  const start = new Date(clockIn)
  const end = new Date(clockOut)
  
  const milliseconds = end.getTime() - start.getTime()
  const minutes = milliseconds / (1000 * 60)
  const hours = (minutes - breakMinutes) / 60
  
  return Math.max(0, hours)
}
