'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { QuoteTypeBadge } from '@/components/quote-type-badge'
import { Eye } from 'lucide-react'
import type { Quote } from '@/lib/db'
import { Checkbox } from '@/components/ui/checkbox'
import { QuoteBulkActions } from '@/components/quote-bulk-actions'

interface QuotesTableProps {
  quotes: Quote[]
  canBulkEdit: boolean
}

export function QuotesTable({ quotes, canBulkEdit }: QuotesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allSelected = useMemo(
    () => quotes.length > 0 && selectedIds.length === quotes.length,
    [selectedIds, quotes]
  )

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? quotes.map((quote) => quote.id) : [])
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  return (
    <div className="space-y-4">
      {canBulkEdit && selectedIds.length > 0 && (
        <QuoteBulkActions selectedIds={selectedIds} onClear={() => setSelectedIds([])} />
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {canBulkEdit && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(value) => toggleSelectAll(!!value)}
                      aria-label="Select all quotes"
                    />
                  </TableHead>
                )}
                <TableHead>Quote #</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quote Date</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote: any) => {
                const total = Number(quote.total_amount || 0)

                return (
                  <TableRow key={quote.id}>
                    {canBulkEdit && (
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(quote.id)}
                          onCheckedChange={(value) => toggleSelect(quote.id, !!value)}
                          aria-label={`Select quote ${quote.quote_no}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{quote.quote_no}</TableCell>
                    <TableCell>
                      {quote.project?.project_no} - {quote.project?.name}
                    </TableCell>
                    <TableCell>
                      {quote.project?.customer?.name}
                    </TableCell>
                    <TableCell>
                      <QuoteTypeBadge type={quote.quote_type} />
                    </TableCell>
                    <TableCell>
                      <QuoteStatusBadge status={quote.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(quote.quote_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/app/quotes/${quote.id}`}>
                        <Button size="sm" variant="ghost" className="gap-2" aria-label="View quote">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden divide-y divide-slate-200">
          {quotes.map((quote: any) => {
            const total = Number(quote.total_amount || 0)

            return (
              <div key={quote.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{quote.quote_no}</p>
                    <p className="text-sm text-slate-500 truncate">{quote.project?.name}</p>
                  </div>
                  <Link href={`/app/quotes/${quote.id}`}>
                    <Button size="icon" variant="ghost" aria-label="View quote" className="min-h-[44px] min-w-[44px]">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <QuoteTypeBadge type={quote.quote_type} />
                  <QuoteStatusBadge status={quote.status} />
                </div>
                <p className="text-sm text-slate-600 truncate">{quote.project?.customer?.name}</p>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-slate-500">
                    {new Date(quote.quote_date).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    ${total.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
