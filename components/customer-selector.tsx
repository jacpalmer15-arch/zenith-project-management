'use client'

import { Control, Controller } from 'react-hook-form'
import { Customer } from '@/lib/db'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CustomerSelectorProps {
  control: Control<any>
  customers: Customer[]
  error?: string
}

export function CustomerSelector({ control, customers, error }: CustomerSelectorProps) {
  return (
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
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
