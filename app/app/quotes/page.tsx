import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuoteFilters } from '@/components/quote-filters'
import { listQuotesWithCount, listProjects } from '@/lib/data'
import { Plus, FileText } from 'lucide-react'
import type { QuoteStatus, QuoteType } from '@/lib/db'
import { EmptyState } from '@/components/empty-state'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { QuotesTable } from '@/components/quotes-table'
import { Pagination } from '@/components/pagination'

interface PageProps {
  searchParams: {
    project_id?: string
    status?: QuoteStatus
    quote_type?: QuoteType | 'All'
    search?: string
    page?: string
  }
}

const PAGE_SIZE = 10

export default async function QuotesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_quotes')) {
    redirect('/app/dashboard')
  }

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
  if (searchParams.search) {
    filters.search = searchParams.search
  }

  const page = Math.max(parseInt(searchParams.page || '1', 10), 1)
  const offset = (page - 1) * PAGE_SIZE

  const { data: quotes, count } = await listQuotesWithCount({
    ...filters,
    limit: PAGE_SIZE,
    offset,
  })
  const projects = await listProjects()
  const totalPages = Math.ceil(count / PAGE_SIZE)

  const canEdit = hasPermission(user?.role, 'edit_quotes')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Quotes</h1>
        {canEdit && (
          <Link href="/app/quotes/new">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Quote
            </Button>
          </Link>
        )}
      </div>

      <QuoteFilters projects={projects} />

      {quotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          {searchParams.search || searchParams.project_id || searchParams.status || searchParams.quote_type ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">
                No quotes found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No quotes yet"
              description="Create your first quote."
              action={
                canEdit
                  ? {
                      label: 'Add Quote',
                      href: '/app/quotes/new',
                    }
                  : undefined
              }
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <QuotesTable quotes={quotes} canBulkEdit={canEdit} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={count}
            itemsPerPage={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  )
}
