'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, MoreHorizontal, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toggleEmployeeStatusAction } from '@/app/actions/employees'
import { toast } from 'sonner'
import { Employee } from '@/lib/db'

interface EmployeeActionsDropdownProps {
  employee: Employee
}

export function EmployeeActionsDropdown({ employee }: EmployeeActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      const result = await toggleEmployeeStatusAction(employee.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          result.is_active 
            ? `${employee.display_name} has been activated` 
            : `${employee.display_name} has been deactivated`
        )
      }
    } catch (error) {
      toast.error('Failed to update employee status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/employees/${employee.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
          {employee.is_active ? (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Activate
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
