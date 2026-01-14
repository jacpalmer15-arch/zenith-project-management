'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'customer_no', label: 'Customer #' },
  { value: 'created_at', label: 'Created date' },
]

export function CustomerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const hasEmail = searchParams.get('has_email') === 'true'
  const hasPhone = searchParams.get('has_phone') === 'true'
  const sort = searchParams.get('sort') || 'name'
  const direction = searchParams.get('direction') || 'asc'

  const hasActiveFilters = useMemo(
    () => !!searchValue || hasEmail || hasPhone,
    [searchValue, hasEmail, hasPhone]
  )

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/app/customers?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchValue}
            onChange={(event) => {
              const value = event.target.value
              setSearchValue(value)
              updateParam('search', value || undefined)
            }}
            className="pl-9"
            aria-label="Search customers"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has_email"
              checked={hasEmail}
              onCheckedChange={(checked) =>
                updateParam('has_email', checked ? 'true' : undefined)
              }
            />
            <Label htmlFor="has_email" className="text-sm text-slate-600">
              Has email
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="has_phone"
              checked={hasPhone}
              onCheckedChange={(checked) =>
                updateParam('has_phone', checked ? 'true' : undefined)
              }
            />
            <Label htmlFor="has_phone" className="text-sm text-slate-600">
              Has phone
            </Label>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-slate-600">Sort by</Label>
          <Select
            value={sort}
            onValueChange={(value) => updateParam('sort', value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-slate-600">Direction</Label>
          <Select
            value={direction}
            onValueChange={(value) => updateParam('direction', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/app/customers')}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
