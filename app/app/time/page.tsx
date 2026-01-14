import { listTimeEntriesWithCount, getActiveEmployees, listWorkOrders } from '@/lib/data'
import { calculateHours } from '@/lib/utils/work-order-utils'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { TimeEntryFilters } from '@/components/time-entry-filters'
import { Pagination } from '@/components/pagination'

interface TimePageProps {
  searchParams: {
    tech_user_id?: string
    work_order_id?: string
    start_date?: string
    end_date?: string
    page?: string
  }
}

const PAGE_SIZE = 10

export default async function TimePage({ searchParams }: TimePageProps) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_time')) {
    redirect('/app/dashboard')
  }

  const page = Math.max(parseInt(searchParams.page || '1', 10), 1)
  const offset = (page - 1) * PAGE_SIZE

  const techFilter = user?.role === 'TECH' ? user.employee?.id : searchParams.tech_user_id
  if (user?.role === 'TECH' && !techFilter) {
    redirect('/app/dashboard')
  }

  const { data: timeEntries, count } = await listTimeEntriesWithCount({
    tech_user_id: techFilter,
    work_order_id: searchParams.work_order_id,
    start_date: searchParams.start_date,
    end_date: searchParams.end_date,
    limit: PAGE_SIZE,
    offset,
  })

  const totalPages = Math.ceil(count / PAGE_SIZE)

  const employees = await getActiveEmployees()
  const workOrders = await listWorkOrders({ limit: 50, offset: 0 })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user?.role === 'TECH' ? 'My Time Entries' : 'Time Tracking'}
          </h1>
          <p className="text-slate-600 mt-1">
            {user?.role === 'TECH'
              ? 'Track your submitted hours'
              : 'Employee time entries and labor tracking'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <TimeEntryFilters
          employees={employees}
          workOrders={workOrders}
          isTech={user?.role === 'TECH'}
        />
      </div>

      {timeEntries.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">
            No time entries yet. Time entries are added to work orders.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Break (min)</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => {
                const hours = entry.clock_out_at
                  ? calculateHours(entry.clock_in_at, entry.clock_out_at, entry.break_minutes)
                  : 0

                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.work_order.work_order_no}
                    </TableCell>
                    <TableCell>
                      {entry.work_order.customer.name}
                    </TableCell>
                    <TableCell>
                      {entry.employee.display_name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(entry.clock_in_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.clock_out_at
                        ? format(new Date(entry.clock_out_at), 'MMM d, h:mm a')
                        : '-'}
                    </TableCell>
                    <TableCell>{entry.break_minutes}</TableCell>
                    <TableCell className="font-medium">
                      {hours > 0 ? hours.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell>
                      <Link href={`/app/work-orders/${entry.work_order.id}`}>
                        <Button variant="ghost" size="sm">
                          View WO
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
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
