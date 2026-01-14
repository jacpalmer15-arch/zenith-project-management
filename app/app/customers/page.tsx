import Link from 'next/link'
import { listCustomersWithCount } from '@/lib/data'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Users } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { CustomerFilters } from '@/components/customer-filters'
import { Pagination } from '@/components/pagination'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

interface CustomersPageProps {
  searchParams: {
    search?: string
    has_email?: string
    has_phone?: string
    sort?: 'name' | 'customer_no' | 'created_at'
    direction?: 'asc' | 'desc'
    page?: string
  }
}

const PAGE_SIZE = 10

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_customers')) {
    redirect('/app/dashboard')
  }

  const page = Math.max(parseInt(searchParams.page || '1', 10), 1)
  const offset = (page - 1) * PAGE_SIZE

  const { data: customers, count } = await listCustomersWithCount({
    search: searchParams.search,
    has_email: searchParams.has_email === 'true',
    has_phone: searchParams.has_phone === 'true',
    sort: searchParams.sort,
    sort_direction: searchParams.direction,
    limit: PAGE_SIZE,
    offset,
  })

  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage customer profiles and contact info</p>
        </div>
        {hasPermission(user?.role, 'edit_customers') && (
          <Link href="/app/customers/new">
            <Button className="w-full sm:w-auto">Add Customer</Button>
          </Link>
        )}
      </div>

      <div className="mb-6">
        <CustomerFilters />
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          {searchParams.search || searchParams.has_email || searchParams.has_phone ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">
                No customers found matching your filters.
              </p>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Add your first customer to get started."
              action={
                hasPermission(user?.role, 'edit_customers')
                  ? {
                      label: 'Add Customer',
                      href: '/app/customers/new',
                    }
                  : undefined
              }
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer #</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.customer_no}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.contact_name || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>
                      <Link href={`/app/customers/${customer.id}`}>
                        <Button variant="ghost" size="icon" aria-label="View customer">
                          <Eye className="h-4 w-4" />
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
            {customers.map((customer) => (
              <div key={customer.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.customer_no}</p>
                  </div>
                  <Link href={`/app/customers/${customer.id}`}>
                    <Button variant="ghost" size="icon" aria-label="View customer" className="min-h-[44px] min-w-[44px]">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                {customer.contact_name && (
                  <p className="text-sm text-slate-600">{customer.contact_name}</p>
                )}
                {customer.phone && (
                  <p className="text-sm text-slate-600">{customer.phone}</p>
                )}
                {customer.email && (
                  <p className="text-sm text-slate-600 truncate">{customer.email}</p>
                )}
              </div>
            ))}
          </div>
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
