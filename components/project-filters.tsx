'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Customer, ProjectStatus } from '@/lib/db'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'Quoted', 'Active', 'Completed', 'Closed']

interface ProjectFiltersProps {
  customers: Customer[]
}

export function ProjectFilters({ customers }: ProjectFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [customerId, setCustomerId] = useState(searchParams.get('customer_id') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    
    // Apply all current filter values
    const currentFilters = {
      search: searchValue,
      customer_id: customerId,
      status: status,
      ...updates,
    }

    // Set or delete params based on values
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/app/projects?${params.toString()}`)
  }, [router, searchParams, searchValue, customerId, status])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchValue })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue, updateFilters])

  const handleCustomerChange = (value: string) => {
    setCustomerId(value)
    updateFilters({ customer_id: value })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    updateFilters({ status: value })
  }

  const clearFilters = () => {
    setSearchValue('')
    setCustomerId('')
    setStatus('')
    router.push('/app/projects')
  }

  const hasActiveFilters = searchValue || customerId || status

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customer Filter */}
      <Select value={customerId} onValueChange={handleCustomerChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Customers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Customers</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          {PROJECT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="h-10"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
