import { listScheduleEntries } from '@/lib/data'
import { format, startOfWeek, endOfWeek, formatISO } from 'date-fns'
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
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function SchedulePage() {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_schedule')) {
    redirect('/app/dashboard')
  }
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const techId = user?.role === 'TECH' ? user.employee?.id : undefined
  if (user?.role === 'TECH' && !techId) {
    redirect('/app/dashboard')
  }

  const scheduleEntries = await listScheduleEntries({
    start_date: weekStart.toISOString(),
    end_date: weekEnd.toISOString(),
    tech_user_id: techId,
  })

  const grouped = scheduleEntries.reduce<Record<string, typeof scheduleEntries>>((acc, entry) => {
    const key = formatISO(new Date(entry.start_at), { representation: 'date' })
    acc[key] = acc[key] || []
    acc[key].push(entry)
    return acc
  }, {})

  const groupedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user?.role === 'TECH' ? 'My Schedule' : 'Schedule'}
          </h1>
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
        <div className="space-y-4">
          {groupedEntries.map(([dateKey, entries]) => (
            <div key={dateKey} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-2 bg-slate-50 text-sm text-slate-600">
                {format(new Date(dateKey), 'EEEE, MMM d')}
              </div>
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
                  {entries.map((entry) => (
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
          ))}
        </div>
      )}
    </div>
  )
}
