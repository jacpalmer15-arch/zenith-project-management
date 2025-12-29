import { z } from 'zod'

export const locationSchema = z.object({
  customer_id: z.string().uuid('Please select a customer'),
  label: z.string().optional().nullable(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  zip: z.string().min(5, 'ZIP code is required'),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export type LocationFormData = z.infer<typeof locationSchema>
