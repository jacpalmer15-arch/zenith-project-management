'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { formatCurrency } from '@/lib/utils/format-currency'
import { groupCostsByPeriod, formatChartCurrency } from '@/lib/utils/chart-data'

interface CostEntry {
  txn_date?: string
  date?: string
  amount: number
}

interface CostTimelineChartProps {
  data: CostEntry[]
  groupBy?: 'day' | 'week' | 'month'
}

interface TimelineDataPoint {
  date: string
  amount: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TimelineDataPoint }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {format(parseISO(data.date), 'MMM d, yyyy')}
        </p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
          {formatCurrency(data.amount)}
        </p>
      </div>
    )
  }
  return null
}

export function CostTimelineChart({
  data,
  groupBy = 'day',
}: CostTimelineChartProps) {
  const chartData = useMemo(() => {
    return groupCostsByPeriod(data, groupBy)
  }, [data, groupBy])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        No timeline data available
      </div>
    )
  }

  const formatXAxis = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      switch (groupBy) {
        case 'month':
          return format(date, 'MMM yyyy')
        case 'week':
          return format(date, 'MMM d')
        case 'day':
        default:
          return format(date, 'MMM d')
      }
    } catch {
      return dateString
    }
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tickFormatter={formatChartCurrency}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
