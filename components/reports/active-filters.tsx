'use client'

import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { CostType, CostCode } from '@/lib/db'

interface ActiveFiltersProps {
  filters: {
    start_date?: string
    end_date?: string
    cost_type_ids?: string[]
    cost_code_ids?: string[]
    source_type?: 'receipt' | 'manual' | 'qb_synced' | null
  }
  costTypes: CostType[]
  costCodes: CostCode[]
  onClearFilter: (filterKey: string) => void
}

export function ActiveFilters({
  filters,
  costTypes,
  costCodes,
  onClearFilter,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.start_date ||
    filters.end_date ||
    (filters.cost_type_ids && filters.cost_type_ids.length > 0) ||
    (filters.cost_code_ids && filters.cost_code_ids.length > 0) ||
    filters.source_type

  if (!hasActiveFilters) return null

  const getCostTypeName = (id: string) => {
    return costTypes.find((t) => t.id === id)?.name || id
  }

  const getCostCodeName = (id: string) => {
    const code = costCodes.find((c) => c.id === id)
    return code ? `${code.code} - ${code.name}` : id
  }

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      receipt: 'Receipt',
      manual: 'Manual Entry',
      qb_synced: 'QB Synced',
    }
    return labels[source] || source
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-slate-600 font-medium">Active Filters:</span>
      
      {filters.start_date && (
        <Badge variant="secondary" className="gap-2">
          From: {format(new Date(filters.start_date), 'MMM d, yyyy')}
          <X
            className="h-3 w-3 cursor-pointer hover:text-slate-900"
            onClick={() => onClearFilter('start_date')}
          />
        </Badge>
      )}

      {filters.end_date && (
        <Badge variant="secondary" className="gap-2">
          To: {format(new Date(filters.end_date), 'MMM d, yyyy')}
          <X
            className="h-3 w-3 cursor-pointer hover:text-slate-900"
            onClick={() => onClearFilter('end_date')}
          />
        </Badge>
      )}

      {filters.cost_type_ids &&
        filters.cost_type_ids.map((typeId) => (
          <Badge key={typeId} variant="secondary" className="gap-2">
            Type: {getCostTypeName(typeId)}
            <X
              className="h-3 w-3 cursor-pointer hover:text-slate-900"
              onClick={() => onClearFilter(`cost_type_id:${typeId}`)}
            />
          </Badge>
        ))}

      {filters.cost_code_ids &&
        filters.cost_code_ids.map((codeId) => (
          <Badge key={codeId} variant="secondary" className="gap-2">
            Code: {getCostCodeName(codeId)}
            <X
              className="h-3 w-3 cursor-pointer hover:text-slate-900"
              onClick={() => onClearFilter(`cost_code_id:${codeId}`)}
            />
          </Badge>
        ))}

      {filters.source_type && (
        <Badge variant="secondary" className="gap-2">
          Source: {getSourceLabel(filters.source_type)}
          <X
            className="h-3 w-3 cursor-pointer hover:text-slate-900"
            onClick={() => onClearFilter('source_type')}
          />
        </Badge>
      )}
    </div>
  )
}
