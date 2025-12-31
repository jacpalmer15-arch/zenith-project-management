import { listScheduleEntries } from '@/lib/data'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SchedulePage() {
  // Get current week
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }) // Sunday

  const scheduleEntries = await listScheduleEntries({
    start_date: weekStart.toISOString(),
    end_date: weekEnd.toISOString(),
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-600 mt-1">
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {scheduleEntries.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">
            No schedule entries for this week.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.employee.display_name}
                  </TableCell>
                  <TableCell>
                    {entry.work_order.work_order_no}
                  </TableCell>
                  <TableCell>
                    {entry.work_order.customer.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(entry.start_at), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(entry.end_at), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.work_order?.status || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/work-orders/${entry.work_order.id}`}>
                      <Button variant="ghost" size="sm">
                        View WO
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
