import { JobCostEntry } from '@/lib/db'
import { format, startOfWeek, startOfMonth, parseISO } from 'date-fns'
import { formatCurrency } from './format-currency'

/**
 * Group costs by date period (day, week, or month)
 */
export function groupCostsByPeriod(
  costs: any[],
  period: 'day' | 'week' | 'month' = 'day'
): { date: string; amount: number }[] {
  const grouped = new Map<string, number>()

  costs.forEach((cost) => {
    if (!cost.date) return

    const date = parseISO(cost.date)
    let key: string

    switch (period) {
      case 'week':
        key = format(startOfWeek(date), 'yyyy-MM-dd')
        break
      case 'month':
        key = format(startOfMonth(date), 'yyyy-MM-dd')
        break
      case 'day':
      default:
        key = format(date, 'yyyy-MM-dd')
        break
    }

    const currentAmount = grouped.get(key) || 0
    grouped.set(key, currentAmount + (cost.amount || 0))
  })

  return Array.from(grouped.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Aggregate costs by cost type
 */
export function aggregateCostsByType(
  costs: any[]
): { cost_type: string; total: number }[] {
  const grouped = new Map<string, number>()

  costs.forEach((cost) => {
    const costType = cost.cost_type_name || cost.cost_type || 'Unknown'
    const currentAmount = grouped.get(costType) || 0
    grouped.set(costType, currentAmount + (cost.amount || 0))
  })

  return Array.from(grouped.entries())
    .map(([cost_type, total]) => ({ cost_type, total }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Aggregate costs by cost code
 */
export function aggregateCostsByCode(
  costs: any[]
): { cost_code: string; cost_code_name: string; total: number }[] {
  const grouped = new Map<string, { name: string; total: number }>()

  costs.forEach((cost) => {
    const costCode = cost.cost_code_code || cost.cost_code || 'UNCODED'
    const costCodeName = cost.cost_code_name || 'Uncoded'
    const current = grouped.get(costCode) || { name: costCodeName, total: 0 }
    grouped.set(costCode, {
      name: costCodeName,
      total: current.total + (cost.amount || 0),
    })
  })

  return Array.from(grouped.entries())
    .map(([cost_code, data]) => ({
      cost_code,
      cost_code_name: data.name,
      total: data.total,
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Format currency for chart display (shorter format)
 */
export function formatChartCurrency(value: number): string {
  if (value === 0) return '$0'
  
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(1)}M`
  } else if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(1)}K`
  }
  
  return formatCurrency(value)
}
