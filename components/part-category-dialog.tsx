'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partCategorySchema, PartCategoryFormData } from '@/lib/validations'
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
import { createPartCategoryAction, updatePartCategoryAction } from '@/app/actions/part-categories'
import { PartCategory } from '@/lib/db'
import { toast } from 'sonner'

interface PartCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: PartCategory
}

export function PartCategoryDialog({ open, onOpenChange, category }: PartCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!category

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PartCategoryFormData>({
    resolver: zodResolver(partCategorySchema),
    defaultValues: category
      ? {
          name: category.name,
          sort_order: category.sort_order,
        }
      : {
          name: '',
          sort_order: 0,
        },
  })

  const onSubmit = async (data: PartCategoryFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (isEditing) {
        formData.append('id', category.id)
      }
      formData.append('name', data.name)
      formData.append('sort_order', data.sort_order.toString())

      const result = isEditing
        ? await updatePartCategoryAction(formData)
        : await createPartCategoryAction(formData)

      if (result.success) {
        toast.success(isEditing ? 'Category updated' : 'Category created')
        reset()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to save category')
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
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Category Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Labor, Materials"
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
