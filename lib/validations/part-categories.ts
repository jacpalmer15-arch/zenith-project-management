import { z } from 'zod'

export const partCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  sort_order: z.number().int().default(0),
})

export type PartCategoryFormData = z.infer<typeof partCategorySchema>
