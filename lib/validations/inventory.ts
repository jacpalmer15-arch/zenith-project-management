import { z } from 'zod'

export const inventoryTransactionSchema = z.object({
  part_id: z.string().uuid('Part is required'),
  txn_type: z.enum(['RECEIPT', 'USAGE', 'ADJUSTMENT', 'RETURN']),
  qty_delta: z.number().refine((val) => val !== 0, {
    message: 'Quantity cannot be zero',
  }),
  unit_cost: z.number().min(0, 'Unit cost must be non-negative').default(0),
  reference_type: z.string().optional().nullable(),
  reference_id: z.string().optional().nullable(),
})

export type InventoryTransactionFormData = z.infer<typeof inventoryTransactionSchema>
