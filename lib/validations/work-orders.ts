import { z } from 'zod'

export const workOrderSchema = z.object({
  customer_id: z.string().uuid('Please select a customer'),
  location_id: z.string().uuid('Please select a location'),
  priority: z.number().min(1).max(5).default(3),
  summary: z.string().min(1, 'Summary is required'),
  description: z.string().default(''),
  requested_window_start: z.string().optional().nullable(),
  requested_window_end: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  status: z.enum(['UNSCHEDULED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELED']).default('UNSCHEDULED'),
}).refine(
  (data) => {
    if (data.requested_window_start && data.requested_window_end) {
      return new Date(data.requested_window_end) > new Date(data.requested_window_start)
    }
    return true
  },
  {
    message: 'End time must be after start time',
    path: ['requested_window_end'],
  }
)

export type WorkOrderFormData = z.infer<typeof workOrderSchema>
