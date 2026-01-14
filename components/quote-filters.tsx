'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import type { Project, QuoteStatus, QuoteType } from '@/lib/db'

interface QuoteFiltersProps {
  projects: Project[]
}

const QUOTE_STATUSES: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']
const QUOTE_TYPES: (QuoteType | 'All')[] = ['All', 'BASE', 'CHANGE_ORDER']

export function QuoteFilters({ projects }: QuoteFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'All') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/app/quotes?${params.toString()}`)
  }, [router, searchParams])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, updateFilter])

  const clearFilters = () => {
    setSearchTerm('')
    router.push('/app/quotes')
  }

  const hasFilters =
    searchParams.get('project_id') ||
    searchParams.get('status') ||
    searchParams.get('quote_type') ||
    searchParams.get('search')

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Quote #</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Project Filter */}
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select
            value={searchParams.get('project_id') || 'All'}
            onValueChange={(value) => updateFilter('project_id', value)}
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_no} - {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={searchParams.get('status') || 'All'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {QUOTE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quote Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="quote_type">Quote Type</Label>
          <Select
            value={searchParams.get('quote_type') || 'All'}
            onValueChange={(value) => updateFilter('quote_type', value)}
          >
            <SelectTrigger id="quote_type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {QUOTE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'All' ? 'All Types' : type === 'BASE' ? 'Base' : 'Change Order'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
