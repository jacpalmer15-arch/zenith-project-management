'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Employee, WorkOrder } from '@/lib/db'

interface TimeEntryFiltersProps {
  employees: Employee[]
  workOrders: WorkOrder[]
  isTech: boolean
}

export function TimeEntryFilters({ employees, workOrders, isTech }: TimeEntryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const hasFilters = useMemo(
    () =>
      !!searchParams.get('tech_user_id') ||
      !!searchParams.get('work_order_id') ||
      !!searchParams.get('start_date') ||
      !!searchParams.get('end_date'),
    [searchParams]
  )

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/app/time?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
      {!isTech && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-sm text-slate-600">Technician</Label>
            <Select
              value={searchParams.get('tech_user_id') || 'all'}
              onValueChange={(value) =>
                updateParam('tech_user_id', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All technicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All technicians</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-slate-600">Work Order</Label>
            <Select
              value={searchParams.get('work_order_id') || 'all'}
              onValueChange={(value) =>
                updateParam('work_order_id', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All work orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All work orders</SelectItem>
                {workOrders.map((wo) => (
                  <SelectItem key={wo.id} value={wo.id}>
                    {wo.work_order_no}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-sm text-slate-600">Start date</Label>
          <Input
            type="date"
            defaultValue={searchParams.get('start_date') || ''}
            onChange={(event) => updateParam('start_date', event.target.value || undefined)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-slate-600">End date</Label>
          <Input
            type="date"
            defaultValue={searchParams.get('end_date') || ''}
            onChange={(event) => updateParam('end_date', event.target.value || undefined)}
          />
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={() => router.push('/app/time')}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
