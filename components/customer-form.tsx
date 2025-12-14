'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, CustomerFormData } from '@/lib/validations/customers'
import { createCustomerAction, updateCustomerAction } from '@/app/actions/customers'
import { Customer } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface CustomerFormProps {
  customer?: Customer
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sameAsBilling, setSameAsBilling] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      contact_name: customer?.contact_name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      billing_street: customer?.billing_street || '',
      billing_city: customer?.billing_city || '',
      billing_state: customer?.billing_state || '',
      billing_zip: customer?.billing_zip || '',
      service_street: customer?.service_street || '',
      service_city: customer?.service_city || '',
      service_state: customer?.service_state || '',
      service_zip: customer?.service_zip || '',
      notes: customer?.notes || '',
    },
  })

  // Watch billing fields for "same as billing" functionality
  const billingStreet = watch('billing_street')
  const billingCity = watch('billing_city')
  const billingState = watch('billing_state')
  const billingZip = watch('billing_zip')

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked)
    if (checked) {
      setValue('service_street', billingStreet || '')
      setValue('service_city', billingCity || '')
      setValue('service_state', billingState || '')
      setValue('service_zip', billingZip || '')
    }
  }

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('contact_name', data.contact_name || '')
      formData.append('phone', data.phone || '')
      formData.append('email', data.email || '')
      formData.append('billing_street', data.billing_street || '')
      formData.append('billing_city', data.billing_city || '')
      formData.append('billing_state', data.billing_state || '')
      formData.append('billing_zip', data.billing_zip || '')
      formData.append('service_street', data.service_street || '')
      formData.append('service_city', data.service_city || '')
      formData.append('service_state', data.service_state || '')
      formData.append('service_zip', data.service_zip || '')
      formData.append('notes', data.notes || '')

      let result
      if (customer) {
        result = await updateCustomerAction(customer.id, formData)
      } else {
        result = await createCustomerAction(formData)
      }

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(customer ? 'Customer updated successfully' : 'Customer created successfully')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="ABC Company"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input
              id="contact_name"
              {...register('contact_name')}
              placeholder="John Doe"
            />
            {errors.contact_name && (
              <p className="text-sm text-red-600 mt-1">{errors.contact_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="(555) 123-4567"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Billing Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="billing_street">Street</Label>
            <Input
              id="billing_street"
              {...register('billing_street')}
              placeholder="123 Main St"
            />
            {errors.billing_street && (
              <p className="text-sm text-red-600 mt-1">{errors.billing_street.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="billing_city">City</Label>
            <Input
              id="billing_city"
              {...register('billing_city')}
              placeholder="Anytown"
            />
            {errors.billing_city && (
              <p className="text-sm text-red-600 mt-1">{errors.billing_city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="billing_state">State</Label>
            <Input
              id="billing_state"
              {...register('billing_state')}
              placeholder="CA"
            />
            {errors.billing_state && (
              <p className="text-sm text-red-600 mt-1">{errors.billing_state.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="billing_zip">ZIP</Label>
            <Input
              id="billing_zip"
              {...register('billing_zip')}
              placeholder="12345"
            />
            {errors.billing_zip && (
              <p className="text-sm text-red-600 mt-1">{errors.billing_zip.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Address */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Service Address</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="same_as_billing"
              checked={sameAsBilling}
              onCheckedChange={handleSameAsBillingChange}
            />
            <Label
              htmlFor="same_as_billing"
              className="text-sm font-normal cursor-pointer"
            >
              Same as billing
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="service_street">Street</Label>
            <Input
              id="service_street"
              {...register('service_street')}
              placeholder="123 Main St"
              disabled={sameAsBilling}
            />
            {errors.service_street && (
              <p className="text-sm text-red-600 mt-1">{errors.service_street.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="service_city">City</Label>
            <Input
              id="service_city"
              {...register('service_city')}
              placeholder="Anytown"
              disabled={sameAsBilling}
            />
            {errors.service_city && (
              <p className="text-sm text-red-600 mt-1">{errors.service_city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="service_state">State</Label>
            <Input
              id="service_state"
              {...register('service_state')}
              placeholder="CA"
              disabled={sameAsBilling}
            />
            {errors.service_state && (
              <p className="text-sm text-red-600 mt-1">{errors.service_state.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="service_zip">ZIP</Label>
            <Input
              id="service_zip"
              {...register('service_zip')}
              placeholder="12345"
              disabled={sameAsBilling}
            />
            {errors.service_zip && (
              <p className="text-sm text-red-600 mt-1">{errors.service_zip.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Notes</h2>
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Add any additional notes about this customer..."
            rows={4}
          />
          {errors.notes && (
            <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-6 border-t border-slate-200 flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/app/customers')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
