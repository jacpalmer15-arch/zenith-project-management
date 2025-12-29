'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { equipmentSchema, EquipmentFormData } from '@/lib/validations/equipment'
import { Equipment } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createEquipment, updateEquipment } from '@/lib/data'

interface EquipmentFormProps {
  equipment?: Equipment
}

export function EquipmentForm({ equipment }: EquipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!equipment
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      ...(equipment ? {
        name: equipment.name,
        serial_no: equipment.serial_no,
        hourly_rate: equipment.hourly_rate,
        daily_rate: equipment.daily_rate,
        is_active: equipment.is_active,
      } : {
        is_active: true,
        hourly_rate: 0,
        daily_rate: 0,
      }),
    },
  })

  const onSubmit = async (data: EquipmentFormData) => {
    setIsSubmitting(true)

    try {
      if (isEdit && equipment) {
        await updateEquipment(equipment.id, data)
        toast.success('Equipment updated successfully')
      } else {
        await createEquipment(data)
        toast.success('Equipment created successfully')
      }
      router.push('/app/equipment')
      router.refresh()
    } catch (error) {
      toast.error(isEdit ? 'Failed to update equipment' : 'Failed to create equipment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isActive = watch('is_active')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register('name')}
            className="mt-1"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="serial_no">Serial Number</Label>
          <Input
            id="serial_no"
            {...register('serial_no')}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hourly_rate">Hourly Rate *</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              {...register('hourly_rate', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.hourly_rate && (
              <p className="text-sm text-red-600 mt-1">{errors.hourly_rate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="daily_rate">Daily Rate *</Label>
            <Input
              id="daily_rate"
              type="number"
              step="0.01"
              min="0"
              {...register('daily_rate', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.daily_rate && (
              <p className="text-sm text-red-600 mt-1">{errors.daily_rate.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
          />
          <Label htmlFor="is_active" className="font-normal">
            Active
          </Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEdit ? 'Update Equipment' : 'Create Equipment')}
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
