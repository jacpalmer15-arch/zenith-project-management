'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Project, ProjectInsert, ProjectUpdate, ProjectStatus } from '@/lib/db'

export interface ListProjectsOptions {
  customer_id?: string
  status?: ProjectStatus
  search?: string
}

export interface ListProjectsWithCountOptions extends ListProjectsOptions {
  limit?: number
  offset?: number
}

/**
 * List all projects with optional filters
 */
export async function listProjects(
  options?: ListProjectsOptions
): Promise<Project[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('projects')
    .select('*, customer:customers(id, customer_no, name, contact_name)')
    .order('created_at', { ascending: false })
  
  if (options?.customer_id) {
    query = query.eq('customer_id', options.customer_id)
  }
  
  if (options?.status) {
    query = query.eq('status', options.status)
  }
  
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,project_no.ilike.%${options.search}%`
    )
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }
  
  return (data || []) as Project[]
}

/**
 * List projects with pagination + count
 */
export async function listProjectsWithCount(
  options?: ListProjectsWithCountOptions
): Promise<{ data: Project[]; count: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('*, customer:customers(id, customer_no, name, contact_name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.customer_id) {
    query = query.eq('customer_id', options.customer_id)
  }

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,project_no.ilike.%${options.search}%`
    )
  }

  if (options?.limit) {
    const start = options.offset || 0
    query = query.range(start, start + options.limit - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }

  return {
    data: (data || []) as Project[],
    count: count || 0,
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*, customer:customers(id, customer_no, name, contact_name)')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch project: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Project not found')
  }
  
  return data as Project
}

/**
 * Create a new project
 */
export async function createProject(project: ProjectInsert): Promise<Project> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .insert(project as never)
    .select('*, customer:customers(id, customer_no, name, contact_name)')
    .single()
  
  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Project not returned after creation')
  }
  
  return data as Project
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  updates: ProjectUpdate
): Promise<Project> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .update(updates as never)
    .eq('id', id)
    .select('*, customer:customers(id, customer_no, name, contact_name)')
    .single()
  
  if (error) {
    throw new Error(`Failed to update project: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Project not found after update')
  }
  
  return data as Project
}
