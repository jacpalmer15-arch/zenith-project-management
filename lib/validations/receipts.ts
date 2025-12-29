import { z } from 'zod'

export const receiptSchema = z.object({
  vendor_name: z.string().optional().nullable(),
  receipt_date: z.string().optional().nullable(),
  total_amount: z.number().min(0, 'Amount must be non-negative').default(0),
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

export type ReceiptFormData = z.infer<typeof receiptSchema>
export type ReceiptAllocationFormData = z.infer<typeof receiptAllocationSchema>
