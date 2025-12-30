'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportCsvButton } from '@/components/export-csv-button'
import { InventoryReportRow } from '@/lib/data/reports'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface InventoryClientProps {
  initialData: InventoryReportRow[]
}

export function InventoryClient({ initialData }: InventoryClientProps) {
  const [data] = useState(initialData)

  const csvColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'part_name', label: 'Part Name' },
    { key: 'on_hand_quantity', label: 'On-Hand Qty' },
    { 
      key: 'last_receipt_date', 
      label: 'Last Receipt',
      format: (val: string | null) => val ? format(new Date(val), 'yyyy-MM-dd') : 'N/A'
    },
    { 
      key: 'last_issue_date', 
      label: 'Last Issue',
      format: (val: string | null) => val ? format(new Date(val), 'yyyy-MM-dd') : 'N/A'
    },
    { key: 'total_receipts', label: 'Total Receipts' },
    { key: 'total_issues', label: 'Total Issues' },
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
            <h1 className="text-3xl font-bold text-slate-900">Parts Usage & Inventory</h1>
            <p className="text-slate-500 mt-1">On-hand quantities and usage history</p>
          </div>
        </div>
        <ExportCsvButton data={data} filename="inventory-report" columns={csvColumns} />
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No parts found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Part Name</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">On-Hand</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Last Receipt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Last Issue</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Total Receipts</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Total Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.part_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-sm">{row.sku}</td>
                      <td className="py-3 px-4 font-medium">{row.part_name}</td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span
                          className={
                            row.on_hand_quantity <= 0
                              ? 'text-red-600'
                              : row.on_hand_quantity < 10
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }
                        >
                          {row.on_hand_quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {row.last_receipt_date
                          ? format(new Date(row.last_receipt_date), 'MMM dd, yyyy')
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {row.last_issue_date
                          ? format(new Date(row.last_issue_date), 'MMM dd, yyyy')
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">{row.total_receipts}</td>
                      <td className="py-3 px-4 text-right">{row.total_issues}</td>
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
