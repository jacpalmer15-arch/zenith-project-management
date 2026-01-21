'use server'
import { createClient } from '@/lib/supabase/serverClient'
import { UserRole, normalizeRole } from './permissions'
import { Employee } from '@/lib/db'

export type CurrentUser = {
  id: string
  email: string
  role: UserRole
  employee?: Employee
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null

  const { data: employeeById } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (employeeById) {
    return {
      id: user.id,
      email: user.email,
      role: normalizeRole(employeeById.role) || 'TECH',
      employee: employeeById as Employee,
    }
  }

  await supabase.rpc('link_employee_user_id')

  const { data: linkedEmployee } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (linkedEmployee) {
    return {
      id: user.id,
      email: user.email,
      role: normalizeRole(linkedEmployee.role) || 'TECH',
      employee: linkedEmployee as Employee,
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: 'TECH',
  }
}
