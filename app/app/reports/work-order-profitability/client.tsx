'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { generateCSV, downloadCSV } from '@/lib/utils/csv-export'
import { formatCurrency } from '@/lib/utils/format-currency'
import type { ProfitPreview } from '@/lib/reporting/profit-preview'
import type { WorkOrderWithCustomerLocation } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkOrderProfitabilityClientProps {
  initialData: ProfitPreview[]
  workOrders: WorkOrderWithCustomerLocation[]
}

export function WorkOrderProfitabilityClient({ 
  initialData, 
  workOrders 
}: WorkOrderProfitabilityClientProps) {
  const [profits] = useState(initialData)
  
  // Calculate summary
  const summary = {
    totalRevenue: profits.reduce((sum, p) => sum + p.contractTotal, 0),
    totalCosts: profits.reduce((sum, p) => sum + p.totalCost, 0),
    totalProfit: 0,
    averageMarginPct: 0,
    profitableCount: profits.filter(p => p.status === 'profit').length,
    lossCount: profits.filter(p => p.status === 'loss').length,
  }
  summary.totalProfit = summary.totalRevenue - summary.totalCosts
  summary.averageMarginPct = summary.totalRevenue > 0 
    ? (summary.totalProfit / summary.totalRevenue) * 100 
    : 0

  const handleExportCSV = () => {
    const csv = generateCSV(profits, [
      { key: 'workOrderNo', header: 'Work Order #' },
      { key: 'contractTotal', header: 'Contract Total', format: formatCurrency },
      { key: 'laborCost', header: 'Labor Cost', format: formatCurrency },
      { key: 'materialCost', header: 'Material Cost', format: formatCurrency },
      { key: 'equipmentCost', header: 'Equipment Cost', format: formatCurrency },
      { key: 'totalCost', header: 'Total Cost', format: formatCurrency },
      { key: 'estimatedProfit', header: 'Profit', format: formatCurrency },
      { 
        key: 'profitMarginPct', 
        header: 'Margin %', 
        format: (val) => `${val.toFixed(2)}%` 
      },
      { key: 'status', header: 'Status' }
    ])
    
    downloadCSV('work-order-profitability.csv', csv)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Work Order Profitability</h1>
            <p className="text-slate-500 mt-1">Profit analysis across all work orders</p>
          </div>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalCosts)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(summary.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.averageMarginPct.toFixed(1)}% avg margin
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.profitableCount} / {profits.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.lossCount} losses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead className="text-right">Contract</TableHead>
                <TableHead className="text-right">Costs</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profits.map((profit) => (
                <TableRow key={profit.workOrderId}>
                  <TableCell>
                    <Link 
                      href={`/app/work-orders/${profit.workOrderId}`}
                      className="font-medium hover:underline"
                    >
                      {profit.workOrderNo}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(profit.contractTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(profit.totalCost)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    profit.status === 'profit' && "text-green-600",
                    profit.status === 'loss' && "text-red-600"
                  )}>
                    {formatCurrency(profit.estimatedProfit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {profit.profitMarginPct.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      profit.status === 'profit' ? 'default' :
                      profit.status === 'loss' ? 'destructive' : 'secondary'
                    }>
                      {profit.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
