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
import { Pencil } from 'lucide-react'

interface CustomersPageProps {
  searchParams: {
    search?: string
  }
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const customers = await listCustomers({ search: searchParams.search })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
        <Link href="/app/customers/new">
          <Button>Add Customer</Button>
        </Link>
      </div>

      <div className="mb-6">
        <CustomerSearch />
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            {searchParams.search 
              ? 'No customers found matching your search.'
              : 'No customers yet. Add your first customer to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
                      <Button variant="ghost" size="icon">
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
