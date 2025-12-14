'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createTaxRuleAction, updateTaxRuleAction } from '@/app/actions/tax-rules'
import { TaxRule } from '@/lib/db'
import { toast } from 'sonner'

// Schema for the form (rate as percentage)
const taxRuleFormSchema = z.object({
  name: z.string().min(1, 'Tax rule name is required'),
  rate: z
    .number()
    .min(0, 'Rate must be at least 0')
    .max(100, 'Rate must be at most 100'),
  is_active: z.boolean().default(true),
})

type TaxRuleFormData = z.infer<typeof taxRuleFormSchema>

interface TaxRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taxRule?: TaxRule // If provided, we're editing
}

export function TaxRuleDialog({ open, onOpenChange, taxRule }: TaxRuleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!taxRule

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TaxRuleFormData>({
    resolver: zodResolver(taxRuleFormSchema),
    defaultValues: taxRule
      ? {
          name: taxRule.name,
          rate: taxRule.rate * 100, // Convert decimal to percentage
          is_active: taxRule.is_active,
        }
      : {
          name: '',
          rate: 0,
          is_active: true,
        },
  })

  const isActive = watch('is_active')

  const onSubmit = async (data: TaxRuleFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (isEditing) {
        formData.append('id', taxRule.id)
      }
      formData.append('name', data.name)
      formData.append('rate', data.rate.toString())
      formData.append('is_active', data.is_active.toString())

      const result = isEditing
        ? await updateTaxRuleAction(formData)
        : await createTaxRuleAction(formData)

      if (result.success) {
        toast.success(isEditing ? 'Tax rule updated' : 'Tax rule created')
        reset()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to save tax rule')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tax Rule' : 'Create Tax Rule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Standard Sales Tax"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rate">Tax Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              {...register('rate', { valueAsNumber: true })}
              placeholder="e.g., 8.5"
            />
            {errors.rate && (
              <p className="text-sm text-red-600 mt-1">{errors.rate.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', !!checked)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
