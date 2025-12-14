'use server'

import { createClient } from '@/lib/supabase/serverClient'

export async function getDashboardMetrics() {
  const supabase = await createClient()
  
  // Fetch counts in parallel
  const [
    { count: customersCount },
    { count: activeProjectsCount },
    { count: draftQuotesCount },
    { count: activePartsCount },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'Draft'),
    supabase.from('parts').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])
  
  return {
    customers: customersCount || 0,
    activeProjects: activeProjectsCount || 0,
    draftQuotes: draftQuotesCount || 0,
    activeParts: activePartsCount || 0,
  }
}

export async function getRecentQuotes(limit = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      id,
      quote_no,
      quote_date,
      status,
      total_amount,
      project:projects (
        id,
        name,
        customer:customers (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getRecentProjects(limit = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      project_no,
      name,
      status,
      updated_at,
      customer:customers (
        id,
        name
      )
    `)
    .order('updated_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}
