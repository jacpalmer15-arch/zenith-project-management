import { z } from 'zod'

export const taxRuleSchema = z.object({
  name: z.string().min(1, 'Tax rule name is required'),
  rate: z
    .number()
    .min(0, 'Rate must be at least 0')
    .max(1, 'Rate must be at most 1'),
  is_active: z.boolean().default(true),
})

export type TaxRuleFormData = z.infer<typeof taxRuleSchema>
