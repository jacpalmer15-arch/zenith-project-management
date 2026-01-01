'use client'

import { useState, useCallback } from 'react'
import { CostType, CostCode } from '@/lib/db'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { JobCostFilters } from '@/lib/data/reports'

interface CostFiltersProps {
  onFiltersChange: (filters: JobCostFilters) => void
  availableCostTypes: CostType[]
  availableCostCodes: CostCode[]
  initialFilters?: JobCostFilters
}

export function CostFilters({
  onFiltersChange,
  availableCostTypes,
  availableCostCodes,
  initialFilters = {},
}: CostFiltersProps) {
  const [startDate, setStartDate] = useState(initialFilters.start_date || '')
  const [endDate, setEndDate] = useState(initialFilters.end_date || '')
  const [selectedCostTypes, setSelectedCostTypes] = useState<string[]>(
    initialFilters.cost_type_ids || []
  )
  const [selectedCostCodes, setSelectedCostCodes] = useState<string[]>(
    initialFilters.cost_code_ids || []
  )
  const [sourceType, setSourceType] = useState<string>(
    initialFilters.source_type || 'all'
  )
  const [costTypeDialogOpen, setCostTypeDialogOpen] = useState(false)
  const [costCodeDialogOpen, setCostCodeDialogOpen] = useState(false)

  const applyFilters = useCallback(() => {
    onFiltersChange({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      cost_type_ids:
        selectedCostTypes.length > 0 ? selectedCostTypes : undefined,
      cost_code_ids:
        selectedCostCodes.length > 0 ? selectedCostCodes : undefined,
      source_type:
        sourceType === 'all'
          ? undefined
          : (sourceType as 'receipt' | 'manual' | 'qb_synced'),
    })
  }, [startDate, endDate, selectedCostTypes, selectedCostCodes, sourceType, onFiltersChange])

  const clearAllFilters = () => {
    setStartDate('')
    setEndDate('')
    setSelectedCostTypes([])
    setSelectedCostCodes([])
    setSourceType('all')
    onFiltersChange({})
  }

  const toggleCostType = (typeId: string) => {
    setSelectedCostTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    )
  }

  const toggleCostCode = (codeId: string) => {
    setSelectedCostCodes((prev) =>
      prev.includes(codeId)
        ? prev.filter((id) => id !== codeId)
        : [...prev, codeId]
    )
  }

  const activeFilterCount =
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0) +
    (selectedCostTypes.length > 0 ? 1 : 0) +
    (selectedCostCodes.length > 0 ? 1 : 0) +
    (sourceType !== 'all' ? 1 : 0)

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Cost Type Multi-Select */}
        <div className="space-y-2">
          <Label>Cost Type</Label>
          <Dialog open={costTypeDialogOpen} onOpenChange={setCostTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>
                  {selectedCostTypes.length > 0
                    ? `${selectedCostTypes.length} selected`
                    : 'All Types'}
                </span>
                {selectedCostTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCostTypes.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Cost Types</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableCostTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cost-type-${type.id}`}
                      checked={selectedCostTypes.includes(type.id)}
                      onCheckedChange={() => toggleCostType(type.id)}
                    />
                    <label
                      htmlFor={`cost-type-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCostTypes([])}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCostTypeDialogOpen(false)}
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cost Code Multi-Select */}
        <div className="space-y-2">
          <Label>Cost Code</Label>
          <Dialog open={costCodeDialogOpen} onOpenChange={setCostCodeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>
                  {selectedCostCodes.length > 0
                    ? `${selectedCostCodes.length} selected`
                    : 'All Codes'}
                </span>
                {selectedCostCodes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCostCodes.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Cost Codes</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableCostCodes.map((code) => (
                  <div key={code.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cost-code-${code.id}`}
                      checked={selectedCostCodes.includes(code.id)}
                      onCheckedChange={() => toggleCostCode(code.id)}
                    />
                    <label
                      htmlFor={`cost-code-${code.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {code.code} - {code.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCostCodes([])}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCostCodeDialogOpen(false)}
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Source Type */}
        <div className="space-y-2">
          <Label htmlFor="source_type">Source</Label>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger id="source_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="manual">Manual Entry</SelectItem>
              <SelectItem value="qb_synced">QB Synced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Filter className="h-3 w-3" />
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
