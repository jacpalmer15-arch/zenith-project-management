'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils/format-currency'

interface CostDistributionChartProps {
  data: { cost_type: string; total: number }[]
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const percentage = data.percentage || 0

    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{data.cost_type}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {formatCurrency(data.total)}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          {percentage.toFixed(1)}% of total
        </p>
      </div>
    )
  }
  return null
}

export function CostDistributionChart({ data }: CostDistributionChartProps) {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.total, 0)
    return data.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.total / total) * 100 : 0,
    }))
  }, [data])

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total, 0)
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        No cost data available
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="cost_type"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry: any) =>
              `${entry.cost_type}: ${entry.percentage.toFixed(0)}%`
            }
            labelLine={true}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-sm text-slate-500">Total Cost</p>
        <p className="text-2xl font-bold">{formatCurrency(total)}</p>
      </div>
    </div>
  )
}
