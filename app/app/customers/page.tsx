import Link from 'next/link'
import { listCustomers } from '@/lib/data'
import { CustomerSearch } from '@/components/customer-search'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Users } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

interface CustomersPageProps {
  searchParams: {
    search?: string
  }
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const customers = await listCustomers({ search: searchParams.search })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Customers</h1>
        <Link href="/app/customers/new">
          <Button className="w-full sm:w-auto">Add Customer</Button>
        </Link>
      </div>

      <div className="mb-6">
        <CustomerSearch />
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          {searchParams.search ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">
                No customers found matching your search.
              </p>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Add your first customer to get started."
              action={{
                label: 'Add Customer',
                href: '/app/customers/new',
              }}
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
                      <Link href={`/app/customers/${customer.id}/edit`}>
                        <Button variant="ghost" size="icon" aria-label="Edit customer">
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
            {customers.map((customer) => (
              <div key={customer.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.customer_no}</p>
                  </div>
                  <Link href={`/app/customers/${customer.id}/edit`}>
                    <Button variant="ghost" size="icon" aria-label="Edit customer" className="min-h-[44px] min-w-[44px]">
                      <Pencil className="h-4 w-4" />
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
        </div>
      )}
    </div>
  )
}
