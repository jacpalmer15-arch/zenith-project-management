import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/format-currency'

interface DashboardProfitCardProps {
  totalRevenue: number
  totalCosts: number
  totalProfit: number
  averageMarginPct: number
}

export function DashboardProfitCard({
  totalRevenue,
  totalCosts,
  totalProfit,
  averageMarginPct
}: DashboardProfitCardProps) {
  const status = totalProfit > 0 ? 'profit' : totalProfit === 0 ? 'breakeven' : 'loss'
  const StatusIcon = 
    status === 'profit' ? TrendingUp :
    status === 'loss' ? TrendingDown : Minus
  
  const statusColor = 
    status === 'profit' ? 'text-green-600' :
    status === 'loss' ? 'text-red-600' : 'text-yellow-600'
  
  const bgColor = 
    status === 'profit' ? 'bg-green-50' :
    status === 'loss' ? 'bg-red-50' : 'bg-yellow-50'
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
        <div className={cn('p-2 rounded-lg', bgColor)}>
          <StatusIcon className={cn('w-4 h-4', statusColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', statusColor)}>
          {formatCurrency(totalProfit)}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {averageMarginPct.toFixed(1)}% avg margin
        </p>
        <div className="mt-4 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Revenue:</span>
            <span className="font-medium">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Costs:</span>
            <span className="font-medium">
              {formatCurrency(totalCosts)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
