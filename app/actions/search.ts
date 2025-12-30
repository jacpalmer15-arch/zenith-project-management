'use server'
import { createClient } from '@/lib/supabase/serverClient'

export type SearchResult = {
  type: 'customer' | 'work_order' | 'quote' | 'project'
  id: string
  title: string
  subtitle?: string
  href: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (query.length < 2) return []
  
  const supabase = await createClient()
  const searchPattern = `%${query}%`
  
  const [customers, workOrders, quotes, projects] = await Promise.all([
    // Search customers
    supabase
      .from('customers')
      .select('id, customer_no, name, contact_name')
      .or(`name.ilike.${searchPattern},customer_no.ilike.${searchPattern}`)
      .limit(5),
    
    // Search work orders
    supabase
      .from('work_orders')
      .select('id, work_order_no, summary, status')
      .or(`work_order_no.ilike.${searchPattern},summary.ilike.${searchPattern}`)
      .limit(5),
    
    // Search quotes
    supabase
      .from('quotes')
      .select('id, quote_no, project:projects(name)')
      .ilike('quote_no', searchPattern)
      .limit(5),
    
    // Search projects
    supabase
      .from('projects')
      .select('id, project_no, name, status')
      .or(`name.ilike.${searchPattern},project_no.ilike.${searchPattern}`)
      .limit(5)
  ])
  
  const results: SearchResult[] = []
  
  // Map customers
  if (customers.data && customers.data.length > 0) {
    results.push(
      ...customers.data.map((c: any) => ({
        type: 'customer' as const,
        id: c.id,
        title: c.name,
        subtitle: c.customer_no,
        href: `/app/customers/${c.id}`
      }))
    )
  }
  
  // Map work orders
  if (workOrders.data && workOrders.data.length > 0) {
    results.push(
      ...workOrders.data.map((wo: any) => ({
        type: 'work_order' as const,
        id: wo.id,
        title: wo.work_order_no,
        subtitle: wo.summary || wo.status,
        href: `/app/work-orders/${wo.id}`
      }))
    )
  }
  
  // Map quotes
  if (quotes.data && quotes.data.length > 0) {
    results.push(
      ...quotes.data.map((q: any) => ({
        type: 'quote' as const,
        id: q.id,
        title: q.quote_no,
        subtitle: q.project?.name,
        href: `/app/quotes/${q.id}`
      }))
    )
  }
  
  // Map projects
  if (projects.data && projects.data.length > 0) {
    results.push(
      ...projects.data.map((p: any) => ({
        type: 'project' as const,
        id: p.id,
        title: p.name,
        subtitle: p.project_no,
        href: `/app/projects/${p.id}`
      }))
    )
  }
  
  return results
}
