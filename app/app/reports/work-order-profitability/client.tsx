'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportCsvButton } from '@/components/export-csv-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { WorkOrderProfitabilityRow } from '@/lib/data/reports'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface WorkOrderProfitabilityClientProps {
  initialData: WorkOrderProfitabilityRow[]
}

export function WorkOrderProfitabilityClient({ initialData }: WorkOrderProfitabilityClientProps) {
  const [data] = useState(initialData)

  const summary = {
    totalQuoted: data.reduce((sum, row) => sum + (row.accepted_quote_total || 0), 0),
    totalCosts: data.reduce((sum, row) => sum + row.total_costs, 0),
    overallMargin: 0,
  }
  summary.overallMargin = summary.totalQuoted - summary.totalCosts

  const csvColumns = [
    { key: 'work_order_no', label: 'Work Order No' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'status', label: 'Status' },
    { key: 'accepted_quote_total', label: 'Quote Total' },
    { key: 'total_costs', label: 'Total Costs' },
    { key: 'estimated_margin', label: 'Estimated Margin' },
    { key: 'margin_percentage', label: 'Margin %' },
  ]

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
            <p className="text-slate-500 mt-1">Estimated margins (pre-QuickBooks)</p>
          </div>
        </div>
        <ExportCsvButton
          data={data}
          filename="work-order-profitability"
          columns={csvColumns}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total Quoted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalQuoted.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Overall Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.overallMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${summary.overallMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No work orders with accepted quotes found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Work Order</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Quote Total</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Costs</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Margin</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.work_order_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link
                          href={`/app/work-orders/${row.work_order_id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {row.work_order_no}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{row.customer_name}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 rounded bg-slate-100">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.accepted_quote_total !== null
                          ? `$${row.accepted_quote_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        ${row.total_costs.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          row.estimated_margin !== null && row.estimated_margin >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {row.estimated_margin !== null
                          ? `$${row.estimated_margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : 'N/A'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right ${
                          row.margin_percentage !== null && row.margin_percentage >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {row.margin_percentage !== null
                          ? `${row.margin_percentage.toFixed(1)}%`
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
