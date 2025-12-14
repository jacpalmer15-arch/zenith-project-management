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
import { Pencil, CheckCircle2, XCircle } from 'lucide-react'

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Parts</h1>
        <Link href="/app/parts/new">
          <Button>Add Part</Button>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <Link 
          href="/app/parts" 
          className="px-4 py-2 border-b-2 border-slate-900 font-medium text-slate-900"
        >
          Parts
        </Link>
        <Link 
          href="/app/parts/categories" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900"
        >
          Categories
        </Link>
        <Link 
          href="/app/parts/cost-types" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900"
        >
          Cost Types
        </Link>
        <Link 
          href="/app/parts/cost-codes" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900"
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
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            {searchParams.search || searchParams.category_id || searchParams.is_active
              ? 'No parts found matching your filters.'
              : 'No parts in inventory. Add parts to use in your quotes.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
                    {part.category ? (part.category as any).name : '-'}
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
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
