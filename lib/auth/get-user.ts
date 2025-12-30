'use server'
import { createClient } from '@/lib/supabase/serverClient'
import { UserRole } from './permissions'
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
  
  // Look up employee record by email
  const { data: employeeData, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()
  
  const employee = employeeData as Employee | null
  
  return {
    id: user.id,
    email: user.email,
    role: (employee?.role as UserRole) || 'TECH',
    employee: employee || undefined
  }
}
