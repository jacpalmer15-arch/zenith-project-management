import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  contact_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  
  billing_street: z.string().optional().nullable(),
  billing_city: z.string().optional().nullable(),
  billing_state: z.string().optional().nullable(),
  billing_zip: z.string().optional().nullable(),
  
  service_street: z.string().optional().nullable(),
  service_city: z.string().optional().nullable(),
  service_state: z.string().optional().nullable(),
  service_zip: z.string().optional().nullable(),
  
  notes: z.string().optional().nullable(),
})

export type CustomerFormData = z.infer<typeof customerSchema>
