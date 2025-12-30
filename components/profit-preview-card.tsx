import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/format-currency'
import type { ProfitPreview } from '@/lib/reporting/profit-preview'

export function ProfitPreviewCard({ preview }: { preview: ProfitPreview }) {
  const StatusIcon = 
    preview.status === 'profit' ? TrendingUp :
    preview.status === 'loss' ? TrendingDown : Minus
  
  const statusColor = 
    preview.status === 'profit' ? 'text-green-600' :
    preview.status === 'loss' ? 'text-red-600' : 'text-yellow-600'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profit Preview</span>
          {preview.isEstimate && (
            <span className="text-sm font-normal text-muted-foreground">
              ESTIMATED
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Warnings */}
        {preview.warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside text-sm">
                {preview.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Revenue */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contract Total</span>
            <span className="font-medium">
              {formatCurrency(preview.contractTotal)}
            </span>
          </div>
        </div>
        
        {/* Costs breakdown */}
        <div className="space-y-2 pt-2 border-t">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Costs
          </div>
          
          {preview.laborCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Labor</span>
              <span>{formatCurrency(preview.laborCost)}</span>
            </div>
          )}
          
          {preview.materialCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Material</span>
              <span>{formatCurrency(preview.materialCost)}</span>
            </div>
          )}
          
          {preview.equipmentCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Equipment</span>
              <span>{formatCurrency(preview.equipmentCost)}</span>
            </div>
          )}
          
          {preview.subcontractorCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subcontractor</span>
              <span>{formatCurrency(preview.subcontractorCost)}</span>
            </div>
          )}
          
          {preview.otherCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Other</span>
              <span>{formatCurrency(preview.otherCost)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total Costs</span>
            <span>{formatCurrency(preview.totalCost)}</span>
          </div>
        </div>
        
        {/* Profit */}
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg border-2",
          preview.status === 'profit' && "border-green-200 bg-green-50",
          preview.status === 'loss' && "border-red-200 bg-red-50",
          preview.status === 'breakeven' && "border-yellow-200 bg-yellow-50"
        )}>
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusColor)} />
            <span className="font-medium">Estimated Profit</span>
          </div>
          <div className="text-right">
            <div className={cn("text-xl font-bold", statusColor)}>
              {formatCurrency(preview.estimatedProfit)}
            </div>
            <div className={cn("text-sm", statusColor)}>
              {preview.profitMarginPct.toFixed(1)}% margin
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
