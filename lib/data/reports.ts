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
  
  if (workOrderIds.length > 0) {
    const { data: costEntries, error: costError } = await supabase
      .from('cost_entries')
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
  }

  // Transform to report rows
  const rows: WorkOrderProfitabilityRow[] = (workOrders || []).map((wo: any) => {
    const acceptedQuote = wo.quotes?.find((q: any) => q.status === 'ACCEPTED')
    const acceptedQuoteTotal = acceptedQuote?.total_amount || null
    const totalCosts = costsByWorkOrder[wo.id] || 0
    const estimatedMargin = acceptedQuoteTotal !== null ? acceptedQuoteTotal - totalCosts : null
    const marginPercentage =
      acceptedQuoteTotal && acceptedQuoteTotal > 0
        ? (estimatedMargin! / acceptedQuoteTotal) * 100
        : null

    return {
      work_order_id: wo.id,
      work_order_no: wo.work_order_no,
      customer_name: wo.customer?.name || 'Unknown',
      status: wo.status,
      accepted_quote_total: acceptedQuoteTotal,
      total_costs: totalCosts,
      estimated_margin: estimatedMargin,
      margin_percentage: marginPercentage,
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
      entry_date,
      hours_worked,
      break_minutes,
      employee:employees(id, name),
      work_order:work_orders(
        work_order_no,
        customer:customers(name)
      )
    `)
    .order('entry_date', { ascending: false })

  if (filters?.employee_id) {
    query = query.eq('employee_id', filters.employee_id)
  }
  if (filters?.start_date) {
    query = query.gte('entry_date', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('entry_date', filters.end_date)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch time entries: ${error.message}`)

  const rows: TechHoursRow[] = (data || []).map((entry: any) => ({
    employee_id: entry.employee?.id || '',
    employee_name: entry.employee?.name || 'Unknown',
    date: entry.entry_date,
    work_order_no: entry.work_order?.work_order_no || 'N/A',
    customer_name: entry.work_order?.customer?.name || 'Unknown',
    hours_worked: entry.hours_worked || 0,
    break_minutes: entry.break_minutes || 0,
  }))

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
  
  for (const part of parts || []) {
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

    for (const txn of ledger || []) {
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
