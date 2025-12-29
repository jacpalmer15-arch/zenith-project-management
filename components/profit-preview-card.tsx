import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfitPreviewCardProps {
  totalQuoted: number
  totalCosts: number
  estimatedProfit: number
}

export function ProfitPreviewCard({
  totalQuoted,
  totalCosts,
  estimatedProfit,
}: ProfitPreviewCardProps) {
  const isPositive = estimatedProfit >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const color = isPositive ? 'text-green-600' : 'text-red-600'
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          ${estimatedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Estimated (pre-QB)
        </p>
        <div className="mt-4 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Quoted:</span>
            <span className="font-medium">
              ${totalQuoted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Costs:</span>
            <span className="font-medium">
              ${totalCosts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
