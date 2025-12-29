'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { subDays } from 'date-fns'

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

/**
 * Get estimated profit across all active work orders with accepted quotes
 */
export async function getEstimatedProfit() {
  const supabase = await createClient()

  // Get all work orders with accepted quotes
  const { data: workOrders, error: woError } = await supabase
    .from('work_orders')
    .select(`
      id,
      quotes!work_order_id(
        id,
        status,
        total_amount
      )
    `)
    .in('status', ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'])

  if (woError) throw woError

  // Get work order IDs with accepted quotes
  const workOrdersWithQuotes = (workOrders || [])
    .filter((wo: any) => wo.quotes?.some((q: any) => q.status === 'ACCEPTED'))
    .map((wo: any) => ({
      id: wo.id,
      quoteTotal: wo.quotes.find((q: any) => q.status === 'ACCEPTED')?.total_amount || 0,
    }))

  if (workOrdersWithQuotes.length === 0) {
    return { totalQuoted: 0, totalCosts: 0, estimatedProfit: 0 }
  }

  // Get cost entries for these work orders
  const workOrderIds = workOrdersWithQuotes.map((wo) => wo.id)
  const { data: costEntries, error: costError } = await supabase
    .from('cost_entries')
    .select('work_order_id, amount')
    .in('work_order_id', workOrderIds)

  if (costError) throw costError

  // Sum costs by work order
  const costsByWorkOrder = (costEntries || []).reduce((acc: Record<string, number>, entry: any) => {
    if (entry.work_order_id) {
      acc[entry.work_order_id] = (acc[entry.work_order_id] || 0) + (entry.amount || 0)
    }
    return acc
  }, {})

  // Calculate totals
  const totalQuoted = workOrdersWithQuotes.reduce((sum, wo) => sum + wo.quoteTotal, 0)
  const totalCosts = workOrdersWithQuotes.reduce(
    (sum, wo) => sum + (costsByWorkOrder[wo.id] || 0),
    0
  )
  const estimatedProfit = totalQuoted - totalCosts

  return {
    totalQuoted,
    totalCosts,
    estimatedProfit,
  }
}

/**
 * Get count of work orders completed in last 7 days
 */
export async function getCompletedThisWeek() {
  const supabase = await createClient()
  const sevenDaysAgo = subDays(new Date(), 7).toISOString()

  const { count } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'COMPLETED')
    .gte('completed_at', sevenDaysAgo)

  return count || 0
}

/**
 * Get count of unscheduled work orders
 */
export async function getUnscheduledBacklog() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'UNSCHEDULED')

  return count || 0
}

/**
 * Get top 5 customers by accepted quote totals in last 30 days
 */
export async function getTopCustomersByQuotes() {
  const supabase = await createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  const { data: quotes, error } = await supabase
    .from('quotes')
    .select(`
      total_amount,
      project:projects(
        customer:customers(
          id,
          name
        )
      )
    `)
    .eq('status', 'ACCEPTED')
    .gte('quote_date', thirtyDaysAgo)

  if (error) throw error

  // Sum by customer
  const customerTotals = (quotes || []).reduce((acc: Record<string, any>, quote: any) => {
    const customerId = quote.project?.customer?.id
    const customerName = quote.project?.customer?.name
    if (customerId && customerName) {
      if (!acc[customerId]) {
        acc[customerId] = { id: customerId, name: customerName, total: 0 }
      }
      acc[customerId].total += quote.total_amount || 0
    }
    return acc
  }, {})

  // Sort and take top 5
  const topCustomers = Object.values(customerTotals)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5)

  return topCustomers
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
