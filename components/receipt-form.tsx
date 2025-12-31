'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { receiptSchema, ReceiptFormData } from '@/lib/validations/receipts'
import { createReceiptAction, updateReceiptAction } from '@/app/actions/receipts'
import { Receipt } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ReceiptFormProps {
  receipt?: Receipt
}

export function ReceiptForm({ receipt }: ReceiptFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      vendor_name: receipt?.vendor_name || '',
      receipt_date: receipt?.receipt_date || new Date().toISOString().split('T')[0],
      total_amount: receipt?.total_amount || 0,
      notes: receipt?.notes || '',
      storage_path: receipt?.storage_path || '',
    },
  })

  const onSubmit = async (data: ReceiptFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('vendor_name', data.vendor_name || '')
      formData.append('receipt_date', data.receipt_date || '')
      formData.append('total_amount', String(data.total_amount))
      formData.append('notes', data.notes || '')
      formData.append('storage_path', data.storage_path || '')

      let result
      if (receipt) {
        result = await updateReceiptAction(receipt.id, formData)
      } else {
        result = await createReceiptAction(formData)
      }

      if (result?.error) {
        toast.error(result.error)
        setIsSubmitting(false)
      } else {
        toast.success(receipt ? 'Receipt updated successfully' : 'Receipt created successfully')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Vendor Name */}
      <div>
        <Label htmlFor="vendor_name">
          Vendor Name
        </Label>
        <Input
          id="vendor_name"
          {...register('vendor_name')}
          placeholder="Enter vendor name"
          className="mt-1"
        />
        {errors.vendor_name && (
          <p className="text-sm text-red-600 mt-1">{errors.vendor_name.message}</p>
        )}
      </div>

      {/* Receipt Date */}
      <div>
        <Label htmlFor="receipt_date">
          Receipt Date
        </Label>
        <Input
          id="receipt_date"
          type="date"
          {...register('receipt_date')}
          className="mt-1"
        />
        {errors.receipt_date && (
          <p className="text-sm text-red-600 mt-1">{errors.receipt_date.message}</p>
        )}
      </div>

      {/* Total Amount */}
      <div>
        <Label htmlFor="total_amount">
          Total Amount <span className="text-red-600">*</span>
        </Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            min="0"
            {...register('total_amount', { valueAsNumber: true })}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
        {errors.total_amount && (
          <p className="text-sm text-red-600 mt-1">{errors.total_amount.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">
          Notes
        </Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add any additional notes..."
          className="mt-1"
          rows={4}
        />
        {errors.notes && (
          <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {receipt ? 'Update Receipt' : 'Create Receipt'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
