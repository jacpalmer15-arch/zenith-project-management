'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CostType, CostCode } from '@/lib/db'
import { JobCostTable } from '@/components/reports/job-cost-table'
import { CostFilters } from '@/components/reports/cost-filters'
import { ActiveFilters } from '@/components/reports/active-filters'
import { formatCurrency } from '@/lib/utils/format-currency'
import { Skeleton } from '@/components/ui/skeleton'
import { JobCostFilters } from '@/lib/data/reports'

interface ProjectCostsClientProps {
  projectId: string
  costTypes: CostType[]
  costCodes: CostCode[]
  onFiltersChange: (filters: JobCostFilters) => void
  jobCosts: any[]
  costTypeSummary: any[]
  costCodeSummary: any[]
  materialUsage: any[]
  isLoading?: boolean
}

export function ProjectCostsClient({
  projectId,
  costTypes,
  costCodes,
  onFiltersChange,
  jobCosts,
  costTypeSummary,
  costCodeSummary,
  materialUsage,
  isLoading = false,
}: ProjectCostsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse filters from URL
  const filters = useMemo(() => {
    return {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      cost_type_ids: searchParams.get('cost_type_ids')?.split(',').filter(Boolean) || undefined,
      cost_code_ids: searchParams.get('cost_code_ids')?.split(',').filter(Boolean) || undefined,
      source_type: (searchParams.get('source') as 'receipt' | 'manual' | 'qb_synced') || undefined,
    }
  }, [searchParams])

  const handleFiltersChange = useCallback(
    (newFilters: JobCostFilters) => {
      const params = new URLSearchParams()

      if (newFilters.start_date) params.set('start_date', newFilters.start_date)
      if (newFilters.end_date) params.set('end_date', newFilters.end_date)
      if (newFilters.cost_type_ids && newFilters.cost_type_ids.length > 0) {
        params.set('cost_type_ids', newFilters.cost_type_ids.join(','))
      }
      if (newFilters.cost_code_ids && newFilters.cost_code_ids.length > 0) {
        params.set('cost_code_ids', newFilters.cost_code_ids.join(','))
      }
      if (newFilters.source_type) params.set('source', newFilters.source_type)

      router.push(`/app/projects/${projectId}/costs?${params.toString()}`)
      onFiltersChange(newFilters)
    },
    [router, projectId, onFiltersChange]
  )

  const handleClearFilter = useCallback(
    (filterKey: string) => {
      const params = new URLSearchParams(searchParams)

      if (filterKey === 'start_date') {
        params.delete('start_date')
      } else if (filterKey === 'end_date') {
        params.delete('end_date')
      } else if (filterKey === 'source_type') {
        params.delete('source')
      } else if (filterKey.startsWith('cost_type_id:')) {
        const typeId = filterKey.split(':')[1]
        const currentTypes = params.get('cost_type_ids')?.split(',').filter(Boolean) || []
        const newTypes = currentTypes.filter((id) => id !== typeId)
        if (newTypes.length > 0) {
          params.set('cost_type_ids', newTypes.join(','))
        } else {
          params.delete('cost_type_ids')
        }
      } else if (filterKey.startsWith('cost_code_id:')) {
        const codeId = filterKey.split(':')[1]
        const currentCodes = params.get('cost_code_ids')?.split(',').filter(Boolean) || []
        const newCodes = currentCodes.filter((id) => id !== codeId)
        if (newCodes.length > 0) {
          params.set('cost_code_ids', newCodes.join(','))
        } else {
          params.delete('cost_code_ids')
        }
      }

      const newUrl = params.toString() ? `/app/projects/${projectId}/costs?${params.toString()}` : `/app/projects/${projectId}/costs`
      router.push(newUrl)
    },
    [router, projectId, searchParams]
  )

  const totalCosts = jobCosts.reduce((sum, cost) => sum + cost.amount, 0)
  const receiptSourcedCosts = jobCosts
    .filter((cost) => cost.receipt_id)
    .reduce((sum, cost) => sum + cost.amount, 0)

  return (
    <>
      {/* Filter Component */}
      <CostFilters
        onFiltersChange={handleFiltersChange}
        availableCostTypes={costTypes}
        availableCostCodes={costCodes}
        initialFilters={filters}
      />

      {/* Active Filter Badges */}
      <ActiveFilters
        filters={filters}
        costTypes={costTypes}
        costCodes={costCodes}
        onClearFilter={handleClearFilter}
      />

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500">Total Job Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalCosts)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500">From Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(receiptSourcedCosts)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{jobCosts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500">Cost Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{costCodeSummary.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost by Type */}
      {costTypeSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Costs by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costTypeSummary.map((item) => (
                <div key={item.cost_type} className="flex justify-between items-center">
                  <span className="font-medium">{item.cost_type}</span>
                  <span className="text-lg font-bold">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost by Code */}
      {costCodeSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Costs by Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {costCodeSummary.map((item) => (
                <div key={item.cost_code} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-mono font-medium">{item.cost_code}</span>
                    <span className="text-slate-600 ml-2">{item.cost_code_name}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Material Usage */}
      {materialUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Material Usage by Part</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materialUsage.map((item: any) => (
                <div key={item.part.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{item.part.name}</span>
                    {item.part.sku && (
                      <span className="text-slate-500 text-sm ml-2">({item.part.sku})</span>
                    )}
                    <div className="text-sm text-slate-600">
                      {item.total_qty} {item.part.uom || 'units'}
                    </div>
                  </div>
                  <span className="font-bold">{formatCurrency(item.total_cost)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Job Cost Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Cost Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : jobCosts.length > 0 ? (
            <JobCostTable costs={jobCosts} />
          ) : (
            <p className="text-slate-500 text-center py-8">
              No job costs match the selected filters.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
