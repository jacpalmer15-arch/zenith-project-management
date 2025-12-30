'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workOrderSchema, WorkOrderFormData } from '@/lib/validations/work-orders'
import { createWorkOrderAction, updateWorkOrderAction } from '@/app/actions/work-orders'
import { WorkOrder, Customer, Location, Employee } from '@/lib/db'
import { getLocationsByCustomer } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface WorkOrderFormProps {
  workOrder?: WorkOrder
  customers: Customer[]
  employees: Employee[]
  initialLocations?: Location[]
}

export function WorkOrderForm({ workOrder, customers, employees, initialLocations = [] }: WorkOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [loadingLocations, setLoadingLocations] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customer_id: workOrder?.customer_id || '',
      location_id: workOrder?.location_id || '',
      priority: workOrder?.priority || 3,
      summary: workOrder?.summary || '',
      description: workOrder?.description || '',
      requested_window_start: workOrder?.requested_window_start || null,
      requested_window_end: workOrder?.requested_window_end || null,
      assigned_to: workOrder?.assigned_to || null,
      status: workOrder?.status || 'UNSCHEDULED',
    },
  })

  const customerId = watch('customer_id')

  // Load locations when customer changes
  useEffect(() => {
    if (customerId) {
      setLoadingLocations(true)
      getLocationsByCustomer(customerId)
        .then(setLocations)
        .catch((error) => {
          console.error('Error loading locations:', error)
          toast.error('Failed to load locations')
        })
        .finally(() => setLoadingLocations(false))
    } else {
      setLocations([])
    }
  }, [customerId])

  const onSubmit = async (data: WorkOrderFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('customer_id', data.customer_id)
      formData.append('location_id', data.location_id)
      formData.append('priority', String(data.priority))
      formData.append('summary', data.summary)
      formData.append('description', data.description || '')
      formData.append('requested_window_start', data.requested_window_start || '')
      formData.append('requested_window_end', data.requested_window_end || '')
      formData.append('assigned_to', data.assigned_to || '')
      // Note: status is not included - status changes go through workflow engine

      let result
      if (workOrder) {
        result = await updateWorkOrderAction(workOrder.id, formData)
      } else {
        result = await createWorkOrderAction(formData)
      }

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(workOrder ? 'Work order updated successfully' : 'Work order created successfully')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer & Location */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer & Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer_id">Customer *</Label>
            <Controller
              name="customer_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="customer_id">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.customer_no} - {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customer_id && (
              <p className="text-sm text-red-600 mt-1">{errors.customer_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location_id">Location *</Label>
            <Controller
              name="location_id"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!customerId || loadingLocations}
                >
                  <SelectTrigger id="location_id">
                    <SelectValue placeholder={
                      !customerId ? 'Select customer first' :
                      loadingLocations ? 'Loading locations...' :
                      'Select a location'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.label ? `${location.label} - ` : ''}
                        {location.street}, {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.location_id && (
              <p className="text-sm text-red-600 mt-1">{errors.location_id.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Work Order Details */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Work Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Highest</SelectItem>
                    <SelectItem value="2">2 - High</SelectItem>
                    <SelectItem value="3">3 - Normal</SelectItem>
                    <SelectItem value="4">4 - Low</SelectItem>
                    <SelectItem value="5">5 - Lowest</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && (
              <p className="text-sm text-red-600 mt-1">{errors.priority.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="assigned_to">Assigned To</Label>
            <Controller
              name="assigned_to"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => field.onChange(value === 'UNASSIGNED' ? null : value)} 
                  value={field.value || 'UNASSIGNED'}
                >
                  <SelectTrigger id="assigned_to">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {employees.filter(e => e.is_active).map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="summary">Summary *</Label>
            <Input
              id="summary"
              {...register('summary')}
              placeholder="Brief description of the work"
            />
            {errors.summary && (
              <p className="text-sm text-red-600 mt-1">{errors.summary.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the work..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="requested_window_start">Requested Window Start</Label>
            <Input
              id="requested_window_start"
              type="datetime-local"
              {...register('requested_window_start')}
            />
          </div>

          <div>
            <Label htmlFor="requested_window_end">Requested Window End</Label>
            <Input
              id="requested_window_end"
              type="datetime-local"
              {...register('requested_window_end')}
            />
            {errors.requested_window_end && (
              <p className="text-sm text-red-600 mt-1">{errors.requested_window_end.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            workOrder ? 'Update Work Order' : 'Create Work Order'
          )}
        </Button>
      </div>
    </form>
  )
}
