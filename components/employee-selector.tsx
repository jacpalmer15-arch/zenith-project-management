'use client'

import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { Employee } from '@/lib/db'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EmployeeSelectorProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  employees: Employee[]
  error?: string
  label?: string
  required?: boolean
}

export function EmployeeSelector<T extends FieldValues>({ 
  control, 
  name,
  employees, 
  error,
  label = 'Employee',
  required = false
}: EmployeeSelectorProps<T>) {
  return (
    <div>
      <Label htmlFor={name}>
        {label} {required && '*'}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <SelectTrigger id={name}>
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.display_name} ({employee.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
