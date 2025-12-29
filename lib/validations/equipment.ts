import { z } from 'zod'

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  serial_no: z.string().optional().nullable(),
  hourly_rate: z.number().min(0, 'Hourly rate must be non-negative').default(0),
  daily_rate: z.number().min(0, 'Daily rate must be non-negative').default(0),
  is_active: z.boolean().default(true),
})

export const equipmentUsageSchema = z.object({
  work_order_id: z.string().uuid('Work order is required'),
  equipment_id: z.string().uuid('Equipment is required'),
  start_at: z.string().min(1, 'Start time is required'),
  end_at: z.string().optional().nullable(),
  billed_rate: z.number().min(0, 'Billed rate must be non-negative').default(0),
})

export type EquipmentFormData = z.infer<typeof equipmentSchema>
export type EquipmentUsageFormData = z.infer<typeof equipmentUsageSchema>
