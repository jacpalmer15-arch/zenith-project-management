import { getCostReconciliation } from '@/lib/workflows/cost-reconciliation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { cn } from '@/lib/utils'

export async function WorkOrderCostReconciliation({ 
  workOrderId 
}: { 
  workOrderId: string 
}) {
  const recon = await getCostReconciliation(workOrderId)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Reconciliation</CardTitle>
        <CardDescription>
          Contract vs. Actual Costs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Warnings */}
        {recon.warnings.length > 0 && (
          <Alert variant={
            recon.margin_status === 'negative' ? 'destructive' : 'default'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cost Alerts</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {recon.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Cost breakdown table */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Labor</span>
            <span>{formatCurrency(recon.actual_costs.LABOR)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Material</span>
            <span>{formatCurrency(recon.actual_costs.MATERIAL)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Equipment</span>
            <span>{formatCurrency(recon.actual_costs.EQUIPMENT)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Other</span>
            <span>{formatCurrency(recon.actual_costs.OTHER)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium">
            <span>Total Costs</span>
            <span>{formatCurrency(recon.actual_costs.total)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contract Total</span>
            <span>{formatCurrency(recon.contract_total)}</span>
          </div>
          
          <Separator />
          
          <div className={cn(
            "flex justify-between font-bold text-lg",
            recon.margin_status === 'negative' && "text-red-600",
            recon.margin_status === 'low' && "text-yellow-600",
            recon.margin_status === 'positive' && "text-green-600"
          )}>
            <span>Estimated Margin</span>
            <span>
              {formatCurrency(recon.estimated_margin)} 
              {' '}({recon.margin_pct.toFixed(1)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
