import { z } from 'zod'

export const quoteHeaderSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  work_order_id: z.string().uuid().optional().nullable(),
  quote_type: z.enum(['BASE', 'CHANGE_ORDER']).default('BASE'),
  parent_quote_id: z.string().uuid().optional().nullable(),
  tax_rule_id: z.string().uuid('Tax rule is required'),
  quote_date: z.string(), // ISO date string
  valid_until: z.string().optional().nullable(), // ISO date string
}).refine(
  (data) => {
    // Quote must have either project_id OR work_order_id, but not both
    const hasProject = !!data.project_id
    const hasWorkOrder = !!data.work_order_id
    return (hasProject && !hasWorkOrder) || (!hasProject && hasWorkOrder)
  },
  {
    message: 'Quote must be linked to either a Project or Work Order (not both)',
    path: ['project_id'],
  }
).refine(
  (data) => {
    // If quote_type is CHANGE_ORDER, parent_quote_id is required
    if (data.quote_type === 'CHANGE_ORDER') {
      return !!data.parent_quote_id
    }
    return true
  },
  {
    message: 'Parent quote is required for change orders',
    path: ['parent_quote_id'],
  }
)

export const quoteLineSchema = z.object({
  part_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  uom: z.string().min(1, 'Unit of measure is required'),
  qty: z.number().positive('Quantity must be greater than 0'),
  unit_price: z.number().positive('Unit price must be greater than 0'),
  is_taxable: z.boolean().default(true),
  sku: z.string().optional().nullable(),
})

export type QuoteHeaderFormData = z.infer<typeof quoteHeaderSchema>
export type QuoteLineFormData = z.infer<typeof quoteLineSchema>
