'use server'

import { createClient } from '@/lib/supabase/serverClient'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'ACCEPT'
  | 'REJECT'
  | 'ALLOCATE'
  | 'SEND'
  | 'COMPLETE'

/**
 * Log an audit event
 * 
 * @param entityType - The type of entity (e.g., 'quote', 'work_order', 'cost_entry')
 * @param entityId - The ID of the entity
 * @param action - The action performed
 * @param actorUserId - The ID of the user who performed the action
 * @param beforeData - The data before the action (optional)
 * @param afterData - The data after the action (optional)
 * @param notes - Additional notes about the action (optional)
 */
export async function logAction(
  entityType: string,
  entityId: string | null,
  action: AuditAction,
  actorUserId: string,
  beforeData?: Record<string, any> | null,
  afterData?: Record<string, any> | null,
  notes?: string | null
): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('audit_logs').insert({
      entity_type: entityType,
      entity_id: entityId,
      action,
      actor_user_id: actorUserId,
      before_data: beforeData || null,
      after_data: afterData || null,
      notes: notes || null,
    })

    if (error) {
      console.error('Failed to log audit action:', error)
      // Don't throw - audit logging should not break the main flow
    }
  } catch (err) {
    console.error('Failed to log audit action:', err)
    // Don't throw - audit logging should not break the main flow
  }
}
