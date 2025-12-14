import { z } from 'zod'

export const costCodeSchema = z.object({
  code: z.string().min(1, 'Cost code is required'),
  name: z.string().min(1, 'Cost code name is required'),
  cost_type_id: z.string().uuid('Cost type is required'),
  sort_order: z.number().int().default(0),
})

export type CostCodeFormData = z.infer<typeof costCodeSchema>
