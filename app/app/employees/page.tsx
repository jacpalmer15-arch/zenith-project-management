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
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/role-badge'
import { formatDate } from '@/lib/utils/format-date'
import { CreateEmployeeDialog } from '@/components/create-employee-dialog'
import { EmployeeActionsDropdown } from '@/components/employee-actions-dropdown'
import { EmployeeFilters } from '@/components/employee-filters'

interface EmployeesPageProps {
  searchParams: {
    search?: string
    role?: string
    status?: string
  }
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const { search, role, status } = searchParams
  
  const employees = await listEmployees({
    search: search || undefined,
    role: role && role !== 'all' ? role : undefined,
    is_active: status === 'active' ? true : status === 'inactive' ? false : undefined,
  })

  const totalEmployees = employees.length
  const activeCount = employees.filter(e => e.is_active).length
  const inactiveCount = employees.filter(e => !e.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        
        <CreateEmployeeDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-sm text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-500">{inactiveCount}</div>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <EmployeeFilters />

      {employees.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Users}
              title={search || role || status ? "No employees found" : "No employees yet"}
              description={
                search || role || status 
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Add your first employee to get started."
              }
              action={
                !(search || role || status)
                  ? {
                      label: 'Add Employee',
                      href: '/app/employees/new',
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {employee.display_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link 
                            href={`/app/employees/${employee.id}/edit`}
                            className="font-medium hover:underline"
                          >
                            {employee.display_name}
                          </Link>
                          {employee.email && (
                            <div className="text-sm text-muted-foreground">
                              {employee.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.phone || '—'}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={employee.role as 'ADMIN' | 'OFFICE' | 'TECH'} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(employee.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <EmployeeActionsDropdown employee={employee} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
