'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locationSchema, LocationFormData } from '@/lib/validations/locations'
import { createLocationAction, updateLocationAction } from '@/app/actions/locations'
import { Location, Customer } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface LocationFormProps {
  location?: Location
  customers: Customer[]
  defaultCustomerId?: string
}

export function LocationForm({ location, customers, defaultCustomerId }: LocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      customer_id: location?.customer_id || defaultCustomerId || '',
      label: location?.label || '',
      street: location?.street || '',
      city: location?.city || '',
      state: location?.state || '',
      zip: location?.zip || '',
      notes: location?.notes || '',
      is_active: location?.is_active ?? true,
    },
  })

  const isActive = watch('is_active')

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('customer_id', data.customer_id)
      formData.append('label', data.label || '')
      formData.append('street', data.street)
      formData.append('city', data.city)
      formData.append('state', data.state)
      formData.append('zip', data.zip)
      formData.append('notes', data.notes || '')
      formData.append('is_active', String(data.is_active))

      let result
      if (location) {
        result = await updateLocationAction(location.id, formData)
      } else {
        result = await createLocationAction(formData)
      }

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(location ? 'Location updated successfully' : 'Location created successfully')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer</h2>
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
      </div>

      {/* Address Information */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              {...register('label')}
              placeholder="Home, Shop, Main Office"
            />
            {errors.label && (
              <p className="text-sm text-red-600 mt-1">{errors.label.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="street">Street *</Label>
            <Input
              id="street"
              {...register('street')}
              placeholder="123 Main St"
            />
            {errors.street && (
              <p className="text-sm text-red-600 mt-1">{errors.street.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Anytown"
            />
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              {...register('state')}
              placeholder="CA"
              maxLength={2}
            />
            {errors.state && (
              <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="zip">ZIP Code *</Label>
            <Input
              id="zip"
              {...register('zip')}
              placeholder="12345"
            />
            {errors.zip && (
              <p className="text-sm text-red-600 mt-1">{errors.zip.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this location..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Active
            </Label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : location ? 'Update Location' : 'Create Location'}
        </Button>
      </div>
    </form>
  )
}
