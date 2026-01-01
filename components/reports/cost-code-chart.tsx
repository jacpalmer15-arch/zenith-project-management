'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatChartCurrency } from '@/lib/utils/chart-data'

interface CostCodeChartProps {
  data: { cost_code: string; cost_code_name: string; total: number }[]
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface ChartDataPoint {
  cost_code: string
  cost_code_name: string
  total: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartDataPoint }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {data.cost_code}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {data.cost_code_name}
        </p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
          {formatCurrency(data.total)}
        </p>
      </div>
    )
  }
  return null
}

export function CostCodeChart({ data }: CostCodeChartProps) {
  const chartData = useMemo(() => {
    // Sort by total descending and take top items
    return [...data].sort((a, b) => b.total - a.total)
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        No cost code data available
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tickFormatter={formatChartCurrency}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            dataKey="cost_code"
            type="category"
            width={90}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
