'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Employee, EmployeeInsert, EmployeeUpdate } from '@/lib/db'

export interface ListEmployeesOptions {
  search?: string
  role?: string
  is_active?: boolean
}

/**
 * List all employees with optional filters
 */
export async function listEmployees(
  options?: ListEmployeesOptions
): Promise<Employee[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('employees')
    .select('*')
    .order('display_name')
  
  if (options?.search) {
    query = query.or(
      `display_name.ilike.%${options.search}%,email.ilike.%${options.search}%`
    )
  }

  if (options?.role) {
    query = query.eq('role', options.role)
  }

  if (options?.is_active !== undefined) {
    query = query.eq('is_active', options.is_active)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get a single employee by ID
 */
export async function getEmployee(id: string): Promise<Employee> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch employee: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Employee not found')
  }
  
  return data
}

/**
 * Create a new employee
 */
export async function createEmployee(employee: EmployeeInsert): Promise<Employee> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('employees')
    .insert(employee as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create employee: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Employee not returned after creation')
  }
  
  return data
}

/**
 * Update an employee
 */
export async function updateEmployee(
  id: string,
  updates: EmployeeUpdate
): Promise<Employee> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('employees')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update employee: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Employee not found after update')
  }
  
  return data
}

/**
 * Get active employees (for selectors)
 */
export async function getActiveEmployees(): Promise<Employee[]> {
  return listEmployees({ is_active: true })
}
