'use client'

import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { Location } from '@/lib/db'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LocationSelectorProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  locations: Location[]
  error?: string
  label?: string
  required?: boolean
}

export function LocationSelector<T extends FieldValues>({ 
  control, 
  name,
  locations, 
  error,
  label = 'Location',
  required = false
}: LocationSelectorProps<T>) {
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
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.label ? `${location.label} - ` : ''}
                  {location.street}, {location.city}, {location.state}
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
