'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
import { PartCategory } from '@/lib/db'

interface PartFiltersProps {
  categories: PartCategory[]
}

export function PartFilters({ categories }: PartFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || 'all')
  const [activeStatus, setActiveStatus] = useState(searchParams.get('is_active') || 'all')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    router.push(`/app/parts?${params.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value)
    updateFilters({ category_id: value })
  }

  const handleActiveStatusChange = (value: string) => {
    setActiveStatus(value)
    updateFilters({ is_active: value })
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryId('all')
    setActiveStatus('all')
    router.push('/app/parts')
  }

  const hasFilters = search || categoryId !== 'all' || activeStatus !== 'all'

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={activeStatus} onValueChange={handleActiveStatusChange}>
            <SelectTrigger id="status">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
