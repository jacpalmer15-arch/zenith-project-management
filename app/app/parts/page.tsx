import Link from 'next/link'
import { listParts, listPartCategories } from '@/lib/data'
import { PartFilters } from '@/components/part-filters'
import { ActiveBadge } from '@/components/active-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, CheckCircle2, XCircle, Package } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

interface PartsPageProps {
  searchParams: {
    search?: string
    category_id?: string
    is_active?: string
  }
}

export default async function PartsPage({ searchParams }: PartsPageProps) {
  const categories = await listPartCategories()
  
  // Build filter options
  const filterOptions = {
    search: searchParams.search,
    category_id: searchParams.category_id,
    is_active: searchParams.is_active === 'true' ? true : 
               searchParams.is_active === 'false' ? false : 
               undefined,
  }
  
  const parts = await listParts(filterOptions)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Parts</h1>
        <Link href="/app/parts/new">
          <Button className="w-full sm:w-auto">Add Part</Button>
        </Link>
      </div>

      {/* Navigation Tabs - horizontal scroll on mobile */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
        <Link 
          href="/app/parts" 
          className="px-4 py-2 border-b-2 border-slate-900 font-medium text-slate-900 whitespace-nowrap min-h-[44px] flex items-center"
        >
          Parts
        </Link>
        <Link 
          href="/app/parts/categories" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900 whitespace-nowrap min-h-[44px] flex items-center"
        >
          Categories
        </Link>
        <Link 
          href="/app/parts/cost-types" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900 whitespace-nowrap min-h-[44px] flex items-center"
        >
          Cost Types
        </Link>
        <Link 
          href="/app/parts/cost-codes" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900 whitespace-nowrap min-h-[44px] flex items-center"
        >
          Cost Codes
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <PartFilters categories={categories} />
      </div>

      {/* Parts Table */}
      {parts.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          {searchParams.search || searchParams.category_id || searchParams.is_active ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">
                No parts found matching your filters.
              </p>
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="Your parts catalog is empty"
              description="Add parts to use in quotes."
              action={{
                label: 'Add Part',
                href: '/app/parts/new',
              }}
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop view - table with horizontal scroll */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead className="text-right">Sell Price</TableHead>
                  <TableHead className="text-center">Taxable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">
                      {part.sku || '-'}
                    </TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>
                      {part.category?.name || '-'}
                    </TableCell>
                    <TableCell>{part.uom}</TableCell>
                    <TableCell className="text-right">
                      ${part.sell_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {part.is_taxable ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 inline" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-300 inline" />
                      )}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge isActive={part.is_active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/app/parts/${part.id}/edit`}>
                        <Button variant="ghost" size="sm" aria-label="Edit part">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view - cards */}
          <div className="md:hidden divide-y divide-slate-200">
            {parts.map((part) => (
              <div key={part.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{part.name}</p>
                    <p className="text-sm text-slate-500">{part.sku || 'No SKU'}</p>
                  </div>
                  <Link href={`/app/parts/${part.id}/edit`}>
                    <Button variant="ghost" size="icon" aria-label="Edit part" className="min-h-[44px] min-w-[44px]">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="text-slate-600">{part.category?.name || 'No Category'}</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span className="text-slate-600">{part.uom}</span>
                  </div>
                  <ActiveBadge isActive={part.is_active} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-900">
                    ${part.sell_price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    {part.is_taxable ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-slate-600">Taxable</span>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">Not taxable</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
