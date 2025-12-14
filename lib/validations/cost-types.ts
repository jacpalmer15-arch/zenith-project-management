import { z } from 'zod'

export const costTypeSchema = z.object({
  name: z.string().min(1, 'Cost type name is required'),
  sort_order: z.number().int().default(0),
})

export type CostTypeFormData = z.infer<typeof costTypeSchema>
