'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { costCodeSchema, CostCodeFormData } from '@/lib/validations'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCostCodeAction, updateCostCodeAction } from '@/app/actions/cost-codes'
import { CostType } from '@/lib/db'
import { CostCodeWithRelations } from '@/lib/data/cost-codes'
import { toast } from 'sonner'

interface CostCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  costCode?: CostCodeWithRelations
  costTypes: CostType[]
}

export function CostCodeDialog({ open, onOpenChange, costCode, costTypes }: CostCodeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!costCode

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CostCodeFormData>({
    resolver: zodResolver(costCodeSchema),
    defaultValues: costCode
      ? {
          code: costCode.code,
          name: costCode.name,
          cost_type_id: costCode.cost_type_id,
          sort_order: costCode.sort_order,
        }
      : {
          code: '',
          name: '',
          cost_type_id: '',
          sort_order: 0,
        },
  })

  const onSubmit = async (data: CostCodeFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (isEditing) {
        formData.append('id', costCode.id)
      }
      formData.append('code', data.code)
      formData.append('name', data.name)
      formData.append('cost_type_id', data.cost_type_id)
      formData.append('sort_order', data.sort_order.toString())

      const result = isEditing
        ? await updateCostCodeAction(formData)
        : await createCostCodeAction(formData)

      if (result.success) {
        toast.success(isEditing ? 'Cost code updated' : 'Cost code created')
        reset()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to save cost code')
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
            {isEditing ? 'Edit Cost Code' : 'Create Cost Code'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="code">
              Cost Code <span className="text-red-600">*</span>
            </Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="e.g., LAB-001"
            />
            {errors.code && (
              <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">
              Cost Code Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Installation Labor"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cost_type_id">
              Cost Type <span className="text-red-600">*</span>
            </Label>
            <Select
              value={watch('cost_type_id')}
              onValueChange={(value) => setValue('cost_type_id', value)}
            >
              <SelectTrigger id="cost_type_id">
                <SelectValue placeholder="Select cost type" />
              </SelectTrigger>
              <SelectContent>
                {costTypes.map((costType) => (
                  <SelectItem key={costType.id} value={costType.id}>
                    {costType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cost_type_id && (
              <p className="text-sm text-red-600 mt-1">
                {errors.cost_type_id.message}
              </p>
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
