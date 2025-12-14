'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Project, ProjectInsert, ProjectUpdate, ProjectStatus } from '@/lib/db'

export interface ListProjectsOptions {
  customer_id?: string
  status?: ProjectStatus
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
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }
  
  return (data || []) as Project[]
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
