import { z } from 'zod'

export const costEntrySchema = z.object({
  work_order_id: z.string().uuid().optional().nullable(),
  bucket: z.enum(['LABOR', 'MATERIAL', 'EQUIPMENT', 'SUB', 'OVERHEAD', 'OTHER']),
  origin: z.enum(['ZENITH_ESTIMATE', 'ZENITH_CAPTURED', 'QB_SYNCED']).default('ZENITH_CAPTURED'),
  description: z.string().min(1, 'Description is required'),
  qty: z.number().positive('Quantity must be positive').default(1),
  unit_cost: z.number().min(0, 'Unit cost must be non-negative').default(0),
  part_id: z.string().uuid().optional().nullable(),
  occurred_at: z.string().optional(),
})

export type CostEntryFormData = z.infer<typeof costEntrySchema>
