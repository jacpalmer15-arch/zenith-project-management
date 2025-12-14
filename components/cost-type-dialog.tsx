'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { costTypeSchema, CostTypeFormData } from '@/lib/validations'
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
import { createCostTypeAction, updateCostTypeAction } from '@/app/actions/cost-types'
import { CostType } from '@/lib/db'
import { toast } from 'sonner'

interface CostTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  costType?: CostType
}

export function CostTypeDialog({ open, onOpenChange, costType }: CostTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!costType

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CostTypeFormData>({
    resolver: zodResolver(costTypeSchema),
    defaultValues: costType
      ? {
          name: costType.name,
          sort_order: costType.sort_order,
        }
      : {
          name: '',
          sort_order: 0,
        },
  })

  const onSubmit = async (data: CostTypeFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (isEditing) {
        formData.append('id', costType.id)
      }
      formData.append('name', data.name)
      formData.append('sort_order', data.sort_order.toString())

      const result = isEditing
        ? await updateCostTypeAction(formData)
        : await createCostTypeAction(formData)

      if (result.success) {
        toast.success(isEditing ? 'Cost type updated' : 'Cost type created')
        reset()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to save cost type')
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
          <DialogTitle>
            {isEditing ? 'Edit Cost Type' : 'Create Cost Type'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Cost Type Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Direct Labor, Overhead"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              {...register('sort_order', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.sort_order && (
              <p className="text-sm text-red-600 mt-1">
                {errors.sort_order.message}
              </p>
            )}
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
