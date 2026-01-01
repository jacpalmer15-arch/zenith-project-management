import { z } from 'zod'

// XOR validation: either project_id OR work_order_id must be provided, not both
export const jobCostEntrySchema = z.object({
  // Owner - must be one of these (XOR)
  project_id: z.string().uuid().optional().nullable(),
  work_order_id: z.string().uuid().optional().nullable(),
  
  // Required fields
  cost_type_id: z.string().uuid('Cost type is required'),
  cost_code_id: z.string().uuid('Cost code is required'),
  
  // Quantities and costs
  qty: z.number().positive('Quantity must be positive').default(1),
  unit_cost: z.number().min(0, 'Unit cost must be non-negative').default(0),
  
  // Optional fields
  description: z.string().optional().nullable(),
  txn_date: z.string().optional(),
  
  // Receipt linkage
  receipt_id: z.string().uuid().optional(),
  receipt_line_item_id: z.string().uuid().optional(),
}).refine(
  (data) => {
    // XOR: exactly one of project_id or work_order_id must be provided
    const hasProject = !!data.project_id
    const hasWorkOrder = !!data.work_order_id
    return (hasProject && !hasWorkOrder) || (!hasProject && hasWorkOrder)
  },
  {
    message: 'Must select either a project OR a work order, not both',
    path: ['project_id'], // Show error on project_id field
  }
)

export type JobCostEntryFormData = z.infer<typeof jobCostEntrySchema>
