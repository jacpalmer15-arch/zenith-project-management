'use server'

import { transitionWorkOrder } from '@/lib/workflows/work-order-lifecycle'
import { getWorkOrder, getScheduleEntry, updateScheduleEntry } from '@/lib/data'
import { WorkOrderSchedule } from '@/lib/db'

/**
 * Hook triggered when a schedule entry is created
 * Auto-transitions work order from UNSCHEDULED to SCHEDULED
 */
export async function onScheduleCreated(scheduleEntry: WorkOrderSchedule) {
  const wo = await getWorkOrder(scheduleEntry.work_order_id)
  
  if (wo.status === 'UNSCHEDULED') {
    await transitionWorkOrder(
      wo.id, 
      'SCHEDULED',
      'Auto-transitioned when schedule entry created'
    )
  }
}

/**
 * Hook triggered when a schedule is started
 * Updates schedule status to ARRIVED and transitions work order to IN_PROGRESS
 */
export async function onScheduleStarted(scheduleId: string) {
  const schedule = await getScheduleEntry(scheduleId)
  // TODO: Add status field to work_order_schedule if needed
  // await updateScheduleEntry(scheduleId, { status: 'ARRIVED' })
  
  const wo = await getWorkOrder(schedule.work_order_id)
  if (wo.status === 'SCHEDULED') {
    await transitionWorkOrder(
      wo.id,
      'IN_PROGRESS',
      'Started from schedule'
    )
  }
}

/**
 * Hook triggered when a schedule is ended
 * Updates schedule status to DONE
 * Note: Does NOT auto-transition to COMPLETED
 * User must manually confirm completion with notes
 */
export async function onScheduleEnded(scheduleId: string) {
  // TODO: Add status field to work_order_schedule if needed
  // await updateScheduleEntry(scheduleId, { status: 'DONE' })
  
  // Note: Does NOT auto-transition to COMPLETED
  // User must manually confirm completion with notes
}
