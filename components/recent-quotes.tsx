import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { formatCurrency } from '@/lib/utils/format-currency'
import type { QuoteStatus } from '@/lib/db'

interface RecentQuote {
  id: string
  quote_no: string
  quote_date: string
  status: QuoteStatus
  total_amount: number | null
  project: {
    id: string
    name: string
    customer: {
      id: string
      name: string
    }
  } | null
}

interface RecentQuotesProps {
  quotes: RecentQuote[]
}

export function RecentQuotes({ quotes }: RecentQuotesProps) {
  if (quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              No quotes yet. Create your first quote to get started.
            </p>
            <Link href="/app/quotes/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Quote
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quotes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900">{quote.quote_no}</p>
                  <QuoteStatusBadge status={quote.status} />
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {quote.project?.name || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">
                  {quote.project?.customer?.name || 'N/A'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-slate-500">
                    {new Date(quote.quote_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {quote.total_amount !== null
                      ? formatCurrency(quote.total_amount)
                      : '--'}
                  </p>
                </div>
              </div>
              <Link href={`/app/quotes/${quote.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
