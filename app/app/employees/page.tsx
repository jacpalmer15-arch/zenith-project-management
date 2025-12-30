import Link from 'next/link'
import { listEmployees } from '@/lib/data'
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
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'

export default async function EmployeesPage() {
  const employees = await listEmployees()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Employees</h1>
        <Link href="/app/employees/new">
          <Button className="w-full sm:w-auto">Add Employee</Button>
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Add your first employee to get started."
            action={{
              label: 'Add Employee',
              href: '/app/employees/new',
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.display_name}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.is_active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/app/employees/${employee.id}/edit`}>
                        <Button variant="ghost" size="icon" aria-label="Edit employee">
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
            {employees.map((employee) => (
              <div key={employee.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{employee.display_name}</p>
                    <p className="text-sm text-slate-500">{employee.email || 'No email'}</p>
                  </div>
                  <Link href={`/app/employees/${employee.id}/edit`}>
                    <Button variant="ghost" size="icon" aria-label="Edit employee" className="min-h-[44px] min-w-[44px]">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                {employee.phone && (
                  <p className="text-sm text-slate-600">{employee.phone}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {employee.role}
                  </Badge>
                  {employee.is_active ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
