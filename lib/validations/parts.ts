import { z } from 'zod'

export const partSchema = z.object({
  sku: z.string().optional().nullable(),
  name: z.string().min(1, 'Part name is required'),
  description_default: z.string().default(''),
  category_id: z.string().uuid().optional().nullable(),
  uom: z.string().min(1, 'Unit of measure is required'),
  is_taxable: z.boolean().default(true),
  
  cost_type_id: z.string().uuid().optional().nullable(),
  cost_code_id: z.string().uuid().optional().nullable(),
  
  sell_price: z.number().min(0, 'Sell price must be non-negative').default(0),
  is_active: z.boolean().default(true),
})

export type PartFormData = z.infer<typeof partSchema>
