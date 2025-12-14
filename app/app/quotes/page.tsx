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
import { QuoteFilters } from '@/components/quote-filters'
import { listQuotes, listProjects } from '@/lib/data'
import { Plus, Eye } from 'lucide-react'
import type { QuoteStatus, QuoteType } from '@/lib/db'

interface PageProps {
  searchParams: {
    project_id?: string
    status?: QuoteStatus
    quote_type?: QuoteType | 'All'
    search?: string
  }
}

export default async function QuotesPage({ searchParams }: PageProps) {
  const filters: any = {}
  
  if (searchParams.project_id) {
    filters.project_id = searchParams.project_id
  }
  if (searchParams.status) {
    filters.status = searchParams.status
  }
  if (searchParams.quote_type && searchParams.quote_type !== 'All') {
    filters.quote_type = searchParams.quote_type
  }

  const quotes = await listQuotes(filters)
  const projects = await listProjects()

  // Filter by search term (quote number) on client side after fetch
  let filteredQuotes = quotes
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase()
    filteredQuotes = quotes.filter((quote: any) =>
      quote.quote_no.toLowerCase().includes(searchTerm)
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quotes</h1>
        <Link href="/app/quotes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Quote
          </Button>
        </Link>
      </div>

      <QuoteFilters projects={projects} />

      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            No quotes found. {searchParams.search || searchParams.project_id || searchParams.status || searchParams.quote_type ? 'Try adjusting your filters.' : 'Create a quote for a project to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
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
              {filteredQuotes.map((quote: any) => {
                // TODO: Total should be calculated from quote_lines aggregation
                // Currently showing 0 as we don't have total stored on quote header
                // For production, consider adding total field to quotes table or using RPC
                const total = 0
                
                return (
                  <TableRow key={quote.id}>
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
                        <Button size="sm" variant="ghost" className="gap-2">
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
      )}
    </div>
  )
}
