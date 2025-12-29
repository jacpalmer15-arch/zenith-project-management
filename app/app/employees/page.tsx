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
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function EmployeesPage() {
  const employees = await listEmployees()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
        <Link href="/app/employees/new">
          <Button>Add Employee</Button>
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            No employees yet. Add your first employee to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
