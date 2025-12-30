import { z } from 'zod'

export const qbConnectionSchema = z.object({
  realm_id: z.string().min(1, 'Realm ID is required'),
  access_token: z.string().min(1, 'Access token is required'),
  refresh_token: z.string().min(1, 'Refresh token is required'),
  token_expires_at: z.string().datetime(),
  is_connected: z.boolean().default(true),
  company_file_id: z.string().optional().nullable(),
})

export const qbMappingSchema = z.object({
  zenith_entity_type: z.enum(['customer', 'work_order', 'quote', 'receipt'], {
    errorMap: () => ({ message: 'Invalid entity type' }),
  }),
  zenith_entity_id: z.string().uuid('Invalid entity ID'),
  qb_entity_type: z.enum(['Customer', 'Invoice', 'Bill', 'Job'], {
    errorMap: () => ({ message: 'Invalid QuickBooks entity type' }),
  }),
  qb_list_id: z.string().min(1, 'QuickBooks List ID is required'),
  qb_full_name: z.string().optional().nullable(),
  qb_edit_sequence: z.string().optional().nullable(),
  sync_direction: z.enum(['to_qb', 'from_qb', 'bidirectional']).default('bidirectional'),
})

export const qbSyncLogSchema = z.object({
  sync_type: z.enum(['customer_sync', 'invoice_create', 'bill_create', 'payment_update'], {
    errorMap: () => ({ message: 'Invalid sync type' }),
  }),
  direction: z.enum(['to_qb', 'from_qb'], {
    errorMap: () => ({ message: 'Invalid direction' }),
  }),
  status: z.enum(['success', 'error', 'pending'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
  entity_type: z.string().optional().nullable(),
  entity_id: z.string().uuid().optional().nullable(),
  error_message: z.string().optional().nullable(),
  processed_count: z.number().int().min(0).default(0),
})

export type QbConnectionInput = z.infer<typeof qbConnectionSchema>
export type QbMappingInput = z.infer<typeof qbMappingSchema>
export type QbSyncLogInput = z.infer<typeof qbSyncLogSchema>
