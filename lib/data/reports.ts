'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { format, subDays } from 'date-fns'

// ============================================================================
// Report 1: Work Order Profitability
// ============================================================================

export interface WorkOrderProfitabilityRow {
  work_order_id: string
  work_order_no: string
  customer_name: string
  status: string
  accepted_quote_total: number | null
  total_costs: number
  estimated_margin: number | null
  margin_percentage: number | null
  actual_costs: number | null
  actual_margin: number | null
  actual_margin_percentage: number | null
  variance: number | null
}

export interface WorkOrderProfitabilityFilters {
  start_date?: string
  end_date?: string
  status?: string
  customer_id?: string
}

export async function getWorkOrderProfitability(
  filters?: WorkOrderProfitabilityFilters
): Promise<WorkOrderProfitabilityRow[]> {
  const supabase = await createClient()

  // Get work orders with accepted quotes and cost entries
  let query = supabase
    .from('work_orders')
    .select(`
      id,
      work_order_no,
      status,
      opened_at,
      customer:customers(name),
      quotes!work_order_id(
        id,
        status,
        total_amount
      )
    `)
    .order('work_order_no', { ascending: false })

  if (filters?.start_date) {
    query = query.gte('opened_at', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('opened_at', filters.end_date)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  const { data: workOrders, error: woError } = await query

  if (woError) throw new Error(`Failed to fetch work orders: ${woError.message}`)

  // Get cost entries for all work orders
  const workOrderIds = workOrders?.map((wo: any) => wo.id) || []
  
  let costsByWorkOrder: Record<string, number> = {}
  let actualCostsByWorkOrder: Record<string, number> = {}
  
  if (workOrderIds.length > 0) {
    const { data: costEntries, error: costError } = await supabase
      .from('job_cost_entries')
      .select('work_order_id, amount')
      .in('work_order_id', workOrderIds)

    if (costError) throw new Error(`Failed to fetch cost entries: ${costError.message}`)

    // Sum costs by work order
    costsByWorkOrder = (costEntries || []).reduce((acc: Record<string, number>, entry: any) => {
      if (entry.work_order_id) {
        acc[entry.work_order_id] = (acc[entry.work_order_id] || 0) + (entry.amount || 0)
      }
      return acc
    }, {})

    // Get actual costs from QuickBooks
    const { data: actualCosts, error: actualError } = await supabase
      .from('qb_actual_costs')
      .select('work_order_id, actual_amount')
      .in('work_order_id', workOrderIds)

    if (!actualError && actualCosts) {
      // Sum actual costs by work order
      actualCostsByWorkOrder = (actualCosts || []).reduce((acc: Record<string, number>, entry: any) => {
        if (entry.work_order_id) {
          acc[entry.work_order_id] = (acc[entry.work_order_id] || 0) + parseFloat(entry.actual_amount || 0)
        }
        return acc
      }, {})
    }
  }

  // Transform to report rows
  const rows: WorkOrderProfitabilityRow[] = (workOrders || []).map((wo: any) => {
    const acceptedQuote = wo.quotes?.find((q: any) => q.status === 'ACCEPTED')
    const acceptedQuoteTotal = acceptedQuote?.total_amount || null
    const totalCosts = costsByWorkOrder[wo.id] || 0
    const actualCosts = actualCostsByWorkOrder[wo.id] || null
    const estimatedMargin = acceptedQuoteTotal !== null ? acceptedQuoteTotal - totalCosts : null
    const actualMargin = acceptedQuoteTotal !== null && actualCosts !== null ? acceptedQuoteTotal - actualCosts : null
    const marginPercentage =
      acceptedQuoteTotal && acceptedQuoteTotal > 0
        ? (estimatedMargin! / acceptedQuoteTotal) * 100
        : null
    const actualMarginPercentage =
      acceptedQuoteTotal && acceptedQuoteTotal > 0 && actualMargin !== null
        ? (actualMargin / acceptedQuoteTotal) * 100
        : null
    const variance = actualCosts !== null ? actualCosts - totalCosts : null

    return {
      work_order_id: wo.id,
      work_order_no: wo.work_order_no,
      customer_name: wo.customer?.name || 'Unknown',
      status: wo.status,
      accepted_quote_total: acceptedQuoteTotal,
      total_costs: totalCosts,
      estimated_margin: estimatedMargin,
      margin_percentage: marginPercentage,
      actual_costs: actualCosts,
      actual_margin: actualMargin,
      actual_margin_percentage: actualMarginPercentage,
      variance: variance,
    }
  })

  return rows
}

// ============================================================================
// Report 2: Tech Hours Summary
// ============================================================================

export interface TechHoursRow {
  employee_id: string
  employee_name: string
  date: string
  work_order_no: string
  customer_name: string
  hours_worked: number
  break_minutes: number
}

export interface TechHoursFilters {
  employee_id?: string
  start_date?: string
  end_date?: string
  customer_id?: string
}

export async function getTechHoursSummary(
  filters?: TechHoursFilters
): Promise<TechHoursRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('work_order_time_entries')
    .select(`
      id,
      clock_in_at,
      clock_out_at,
      break_minutes,
      tech_user_id,
      employee:employees!tech_user_id(id, display_name),
      work_order:work_orders(
        work_order_no,
        customer:customers(name)
      )
    `)
    .not('clock_out_at', 'is', null)
    .order('clock_in_at', { ascending: false })

  if (filters?.employee_id) {
    query = query.eq('tech_user_id', filters.employee_id)
  }
  if (filters?.start_date) {
    query = query.gte('clock_in_at', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('clock_in_at', filters.end_date)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch time entries: ${error.message}`)

  const rows: TechHoursRow[] = (data || []).map((entry: any) => {
    // Calculate hours_worked: (clock_out_at - clock_in_at - break_minutes) / 60
    const clockInTime = new Date(entry.clock_in_at).getTime()
    const clockOutTime = new Date(entry.clock_out_at).getTime()
    const breakMinutes = entry.break_minutes || 0
    const totalMinutes = (clockOutTime - clockInTime) / (1000 * 60)
    const hoursWorked = Math.max(0, (totalMinutes - breakMinutes) / 60)

    // Extract date from clock_in_at
    const date = format(new Date(entry.clock_in_at), 'yyyy-MM-dd')

    return {
      employee_id: entry.employee?.id || '',
      employee_name: entry.employee?.display_name || 'Unknown',
      date: date,
      work_order_no: entry.work_order?.work_order_no || 'N/A',
      customer_name: entry.work_order?.customer?.name || 'Unknown',
      hours_worked: hoursWorked,
      break_minutes: breakMinutes,
    }
  })

  return rows
}

// ============================================================================
// Report 3: Parts Usage and Inventory On-Hand
// ============================================================================

export interface InventoryReportRow {
  part_id: string
  sku: string
  part_name: string
  on_hand_quantity: number
  last_receipt_date: string | null
  last_issue_date: string | null
  total_receipts: number
  total_issues: number
}

export interface InventoryFilters {
  category_id?: string
  is_active?: boolean
  search?: string
}

export async function getInventoryReport(
  filters?: InventoryFilters
): Promise<InventoryReportRow[]> {
  const supabase = await createClient()

  let partsQuery = supabase
    .from('parts')
    .select('id, sku, name, category_id, is_active')
    .order('sku')

  if (filters?.category_id) {
    partsQuery = partsQuery.eq('category_id', filters.category_id)
  }
  if (filters?.is_active !== undefined) {
    partsQuery = partsQuery.eq('is_active', filters.is_active)
  }
  if (filters?.search) {
    partsQuery = partsQuery.or(`sku.ilike.%${filters.search}%,name.ilike.%${filters.search}%`)
  }

  const { data: parts, error: partsError } = await partsQuery

  if (partsError) throw new Error(`Failed to fetch parts: ${partsError.message}`)

  // Get inventory ledger for all parts
  const partIds = parts?.map((p: any) => p.id) || []
  
  const rows: InventoryReportRow[] = []
  
  for (const part of (parts as any[]) || []) {
    const { data: ledger, error: ledgerError } = await supabase
      .from('inventory_ledger')
      .select('txn_type, quantity, txn_date')
      .eq('part_id', part.id)

    if (ledgerError) {
      console.error(`Failed to fetch ledger for part ${part.id}:`, ledgerError)
      continue
    }

    let onHandQty = 0
    let lastReceiptDate: string | null = null
    let lastIssueDate: string | null = null
    let totalReceipts = 0
    let totalIssues = 0

    for (const txn of (ledger as any[]) || []) {
      if (txn.txn_type === 'RECEIPT') {
        onHandQty += txn.quantity || 0
        totalReceipts += txn.quantity || 0
        if (!lastReceiptDate || txn.txn_date > lastReceiptDate) {
          lastReceiptDate = txn.txn_date
        }
      } else if (txn.txn_type === 'ISSUE') {
        onHandQty -= txn.quantity || 0
        totalIssues += txn.quantity || 0
        if (!lastIssueDate || txn.txn_date > lastIssueDate) {
          lastIssueDate = txn.txn_date
        }
      }
    }

    rows.push({
      part_id: part.id,
      sku: part.sku,
      part_name: part.name,
      on_hand_quantity: onHandQty,
      last_receipt_date: lastReceiptDate,
      last_issue_date: lastIssueDate,
      total_receipts: totalReceipts,
      total_issues: totalIssues,
    })
  }

  return rows
}

// ============================================================================
// Report 4: Quotes Pipeline
// ============================================================================

export interface QuotesPipelineRow {
  quote_id: string
  quote_no: string
  customer_name: string
  project_name: string | null
  status: string
  quote_date: string
  quote_total: number
  days_in_status: number
}

export interface QuotesPipelineFilters {
  status?: string
  start_date?: string
  end_date?: string
  customer_id?: string
}

export async function getQuotesPipeline(
  filters?: QuotesPipelineFilters
): Promise<QuotesPipelineRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('quotes')
    .select(`
      id,
      quote_no,
      quote_date,
      status,
      total_amount,
      updated_at,
      project:projects(
        name,
        customer:customers(name)
      )
    `)
    .order('quote_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.start_date) {
    query = query.gte('quote_date', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('quote_date', filters.end_date)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch quotes: ${error.message}`)

  const now = new Date()

  const rows: QuotesPipelineRow[] = (data || []).map((quote: any) => {
    const updatedAt = new Date(quote.updated_at)
    const daysInStatus = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      quote_id: quote.id,
      quote_no: quote.quote_no,
      customer_name: quote.project?.customer?.name || 'Unknown',
      project_name: quote.project?.name || null,
      status: quote.status,
      quote_date: quote.quote_date,
      quote_total: quote.total_amount || 0,
      days_in_status: daysInStatus,
    }
  })

  return rows
}

// ============================================================================
// Job Cost Reporting Functions (PR #6)
// ============================================================================

export interface JobCostFilters {
  start_date?: string  // ISO date string
  end_date?: string    // ISO date string
  cost_type_ids?: string[]  // Array of cost type UUIDs
  cost_code_ids?: string[]  // Array of cost code UUIDs
  source_type?: 'receipt' | 'manual' | 'qb_synced' | null
}

/**
 * Get all job costs for a project
 */
export async function getProjectJobCosts(
  projectId: string,
  filters?: JobCostFilters
): Promise<any[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('job_cost_entries')
    .select(`
      *,
      cost_type:cost_types(id, name),
      cost_code:cost_codes(id, code, name),
      part:parts(id, sku, name),
      receipt:receipts(id, vendor_name, receipt_date)
    `)
    .eq('project_id', projectId)
  
  // Apply filters
  if (filters?.start_date) {
    query = query.gte('txn_date', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('txn_date', filters.end_date)
  }
  if (filters?.cost_type_ids && filters.cost_type_ids.length > 0) {
    query = query.in('cost_type_id', filters.cost_type_ids)
  }
  if (filters?.cost_code_ids && filters.cost_code_ids.length > 0) {
    query = query.in('cost_code_id', filters.cost_code_ids)
  }
  if (filters?.source_type) {
    if (filters.source_type === 'receipt') {
      query = query.in('source_type', ['receipt_manual', 'receipt_auto'])
    } else if (filters.source_type === 'manual') {
      query = query.eq('source_type', 'manual')
    } else if (filters.source_type === 'qb_synced') {
      query = query.eq('source_type', 'qb_synced')
    }
  }
  
  query = query.order('txn_date', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw new Error(`Failed to get project costs: ${error.message}`)
  return data || []
}

/**
 * Get all job costs for a work order
 */
export async function getWorkOrderJobCosts(
  workOrderId: string,
  filters?: JobCostFilters
): Promise<any[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('job_cost_entries')
    .select(`
      *,
      cost_type:cost_types(id, name),
      cost_code:cost_codes(id, code, name),
      part:parts(id, sku, name),
      receipt:receipts(id, vendor_name, receipt_date)
    `)
    .eq('work_order_id', workOrderId)
  
  // Apply filters
  if (filters?.start_date) {
    query = query.gte('txn_date', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('txn_date', filters.end_date)
  }
  if (filters?.cost_type_ids && filters.cost_type_ids.length > 0) {
    query = query.in('cost_type_id', filters.cost_type_ids)
  }
  if (filters?.cost_code_ids && filters.cost_code_ids.length > 0) {
    query = query.in('cost_code_id', filters.cost_code_ids)
  }
  if (filters?.source_type) {
    if (filters.source_type === 'receipt') {
      query = query.in('source_type', ['receipt_manual', 'receipt_auto'])
    } else if (filters.source_type === 'manual') {
      query = query.eq('source_type', 'manual')
    } else if (filters.source_type === 'qb_synced') {
      query = query.eq('source_type', 'qb_synced')
    }
  }
  
  query = query.order('txn_date', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw new Error(`Failed to get work order costs: ${error.message}`)
  return data || []
}

/**
 * Get job cost summary by cost type
 */
export async function getJobCostSummaryByCostType(
  targetType: 'project' | 'work_order',
  targetId: string
): Promise<{ cost_type: string; cost_type_id: string; total: number }[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('job_cost_entries')
    .select('amount, cost_type_id, cost_type:cost_types(id, name)')
  
  if (targetType === 'project') {
    query = query.eq('project_id', targetId)
  } else {
    query = query.eq('work_order_id', targetId)
  }
  
  const { data, error } = await query
  
  if (error) throw new Error(`Failed to get cost summary: ${error.message}`)
  
  // Group by cost type
  const grouped = (data || []).reduce((acc: any, entry: any) => {
    const typeId = entry.cost_type?.id || entry.cost_type_id || 'other'
    const typeName = entry.cost_type?.name || 'Other'
    const key = `${typeId}|${typeName}`
    if (!acc[key]) acc[key] = 0
    acc[key] += entry.amount
    return acc
  }, {})
  
  return Object.entries(grouped).map(([key, total]) => {
    const [cost_type_id, cost_type] = (key as string).split('|')
    return { cost_type, cost_type_id, total: total as number }
  })
}

/**
 * Get job cost summary by cost code
 */
export async function getJobCostSummaryByCostCode(
  targetType: 'project' | 'work_order',
  targetId: string
): Promise<{ cost_code: string; cost_code_name: string; cost_code_id: string; total: number }[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('job_cost_entries')
    .select('amount, cost_code_id, cost_code:cost_codes(id, code, name)')
  
  if (targetType === 'project') {
    query = query.eq('project_id', targetId)
  } else {
    query = query.eq('work_order_id', targetId)
  }
  
  const { data, error } = await query
  
  if (error) throw new Error(`Failed to get cost code summary: ${error.message}`)
  
  // Group by cost code
  const grouped = (data || []).reduce((acc: any, entry: any) => {
    const codeId = entry.cost_code?.id || entry.cost_code_id || 'other'
    const code = entry.cost_code?.code || 'Other'
    const name = entry.cost_code?.name || 'Other'
    const key = `${codeId}|${code}|${name}`
    if (!acc[key]) acc[key] = 0
    acc[key] += entry.amount
    return acc
  }, {})
  
  return Object.entries(grouped).map(([key, total]) => {
    const [cost_code_id, cost_code, cost_code_name] = (key as string).split('|')
    return { cost_code, cost_code_name, cost_code_id, total: total as number }
  })
}

/**
 * Get material usage by part
 */
export async function getMaterialUsageByPart(
  targetType: 'project' | 'work_order',
  targetId: string
): Promise<any[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('job_cost_entries')
    .select('qty, amount, part:parts(id, sku, name, uom)')
    .not('part_id', 'is', null)
  
  if (targetType === 'project') {
    query = query.eq('project_id', targetId)
  } else {
    query = query.eq('work_order_id', targetId)
  }
  
  const { data, error } = await query
  
  if (error) throw new Error(`Failed to get material usage: ${error.message}`)
  
  // Group by part
  const grouped = (data || []).reduce((acc: any, entry: any) => {
    const partId = entry.part?.id
    if (!partId) return acc
    
    if (!acc[partId]) {
      acc[partId] = {
        part: entry.part,
        total_qty: 0,
        total_cost: 0
      }
    }
    acc[partId].total_qty += entry.qty
    acc[partId].total_cost += entry.amount
    return acc
  }, {})
  
  return Object.values(grouped)
}
