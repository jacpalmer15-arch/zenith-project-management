'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportCsvButton } from '@/components/export-csv-button'
import { QuotesPipelineRow } from '@/lib/data/reports'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface QuotesPipelineClientProps {
  initialData: QuotesPipelineRow[]
}

export function QuotesPipelineClient({ initialData }: QuotesPipelineClientProps) {
  const [data] = useState(initialData)

  // Calculate summary stats
  const statusTotals = data.reduce((acc: Record<string, number>, row) => {
    acc[row.status] = (acc[row.status] || 0) + row.quote_total
    return acc
  }, {})

  const sentCount = data.filter((r) => r.status === 'SENT').length
  const acceptedCount = data.filter((r) => r.status === 'ACCEPTED').length
  const conversionRate = sentCount > 0 ? (acceptedCount / sentCount) * 100 : 0

  const acceptedQuotes = data.filter((r) => r.status === 'ACCEPTED')
  const avgDaysToAcceptance =
    acceptedQuotes.length > 0
      ? acceptedQuotes.reduce((sum, r) => sum + r.days_in_status, 0) / acceptedQuotes.length
      : 0

  const csvColumns = [
    { key: 'quote_no', label: 'Quote No' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'project_name', label: 'Project' },
    { key: 'status', label: 'Status' },
    { key: 'quote_date', label: 'Quote Date' },
    { key: 'quote_total', label: 'Quote Total' },
    { key: 'days_in_status', label: 'Days in Status' },
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
            <h1 className="text-3xl font-bold text-slate-900">Quotes Pipeline</h1>
            <p className="text-slate-500 mt-1">Pipeline metrics and conversion rates</p>
          </div>
        </div>
        <ExportCsvButton data={data} filename="quotes-pipeline" columns={csvColumns} />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statusTotals).map(([status, total]) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="text-slate-600">{status}:</span>
                  <span className="font-medium">
                    ${(total as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {acceptedCount} accepted / {sentCount} sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">
              Avg Days to Acceptance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDaysToAcceptance.toFixed(1)}</div>
            <p className="text-xs text-slate-500 mt-1">days in status</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No quotes found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Quote No</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Quote Date</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Days in Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.quote_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link
                          href={`/app/quotes/${row.quote_id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {row.quote_no}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{row.customer_name}</td>
                      <td className="py-3 px-4">{row.project_name || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            row.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-700'
                              : row.status === 'SENT'
                              ? 'bg-blue-100 text-blue-700'
                              : row.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(row.quote_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${row.quote_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">{row.days_in_status}</td>
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
