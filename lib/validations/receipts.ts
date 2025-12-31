import { z } from 'zod'

export const receiptSchema = z.object({
  vendor_name: z.string().nullable().default(null),
  receipt_date: z.string().optional().nullable(),
  total_amount: z.coerce.number().min(0, 'Amount must be non-negative').default(0),
  storage_path: z.string().optional().nullable(), // Optional for manual entry
  notes: z.string().optional().nullable(),
})

export const receiptAllocationSchema = z.object({
  allocated_to_work_order_id: z.string().uuid().optional().nullable(),
  allocated_overhead_bucket: z.string().optional().nullable(),
}).refine(
  (data) => {
    // Either work_order_id OR overhead_bucket must be provided, but not both
    const hasWorkOrder = !!data.allocated_to_work_order_id
    const hasOverhead = !!data.allocated_overhead_bucket
    return (hasWorkOrder && !hasOverhead) || (!hasWorkOrder && hasOverhead)
  },
  {
    message: 'Must allocate to either a work order or an overhead bucket',
  }
)

export const receiptLineItemSchema = z.object({
  receipt_id: z.string().uuid('Receipt is required'),
  line_no: z.number().int().min(1, 'Line number must be positive'),
  description: z.string().min(1, 'Description is required'),
  qty: z.coerce.number().positive('Quantity must be positive'),
  unit_cost: z.coerce.number().min(0, 'Unit cost must be non-negative'),
  uom: z.string().optional().nullable(),
  part_id: z.string().uuid().optional().nullable(),
})

export type ReceiptFormData = z.infer<typeof receiptSchema>
export type ReceiptAllocationFormData = z.infer<typeof receiptAllocationSchema>
export type ReceiptLineItemFormData = z.infer<typeof receiptLineItemSchema>
