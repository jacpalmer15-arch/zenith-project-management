'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeInsertSchema, employeeUpdateSchema, EmployeeInsertFormData, EmployeeUpdateFormData } from '@/lib/validations/employees'
import { createEmployeeAction, updateEmployeeAction } from '@/app/actions/employees'
import { Employee } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface EmployeeFormProps {
  employee?: Employee
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!employee

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeInsertFormData | EmployeeUpdateFormData>({
    resolver: zodResolver(isEdit ? employeeUpdateSchema : employeeInsertSchema),
    defaultValues: {
      ...(employee ? {
        display_name: employee.display_name,
        email: employee.email || '',
        phone: employee.phone || '',
        role: employee.role,
        is_active: employee.is_active,
      } : {
        id: crypto.randomUUID(),
        display_name: '',
        email: '',
        phone: '',
        role: 'TECH',
        is_active: true,
      }),
    },
  })

  const role = watch('role')
  const isActive = watch('is_active')

  const onSubmit = async (data: EmployeeInsertFormData | EmployeeUpdateFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      if (!isEdit && 'id' in data) {
        formData.append('id', data.id)
      }
      formData.append('display_name', data.display_name)
      formData.append('email', data.email || '')
      formData.append('phone', data.phone || '')
      formData.append('role', data.role || 'TECH')
      formData.append('is_active', String(data.is_active))

      let result
      if (employee) {
        result = await updateEmployeeAction(employee.id, formData)
      } else {
        result = await createEmployeeAction(formData)
      }

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(employee ? 'Employee updated successfully' : 'Employee created successfully')
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
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Employee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display_name">Name *</Label>
            <Input
              id="display_name"
              {...register('display_name')}
              placeholder="John Doe"
            />
            {errors.display_name && (
              <p className="text-sm text-red-600 mt-1">{errors.display_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
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
            <Label htmlFor="role">Role *</Label>
            <Select
              value={role}
              onValueChange={(value) => setValue('role', value as 'TECH' | 'OFFICE' | 'ADMIN')}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TECH">Technician</SelectItem>
                <SelectItem value="OFFICE">Office</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
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
          {isSubmitting ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  )
}
