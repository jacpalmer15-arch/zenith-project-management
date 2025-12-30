'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportCsvButton } from '@/components/export-csv-button'
import { TechHoursRow } from '@/lib/data/reports'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface TechHoursClientProps {
  initialData: TechHoursRow[]
}

export function TechHoursClient({ initialData }: TechHoursClientProps) {
  const [data] = useState(initialData)

  // Calculate summary stats
  const employeeStats = data.reduce((acc: Record<string, any>, row) => {
    if (!acc[row.employee_id]) {
      acc[row.employee_id] = {
        name: row.employee_name,
        totalHours: 0,
        days: new Set(),
      }
    }
    acc[row.employee_id].totalHours += row.hours_worked
    acc[row.employee_id].days.add(row.date)
    return acc
  }, {})

  const summary = Object.values(employeeStats).map((stat: any) => ({
    name: stat.name,
    totalHours: stat.totalHours,
    avgHoursPerDay: stat.totalHours / stat.days.size,
  }))

  const csvColumns = [
    { key: 'employee_name', header: 'Employee' },
    { key: 'date', header: 'Date' },
    { key: 'work_order_no', header: 'Work Order' },
    { key: 'customer_name', header: 'Customer' },
    { 
      key: 'hours_worked', 
      header: 'Hours Worked',
      format: (val: number) => val.toFixed(2)
    },
    { key: 'break_minutes', header: 'Break Minutes' },
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
            <h1 className="text-3xl font-bold text-slate-900">Tech Hours Summary</h1>
            <p className="text-slate-500 mt-1">Employee time tracking across work orders</p>
          </div>
        </div>
        <ExportCsvButton data={data} filename="tech-hours-summary" columns={csvColumns} />
      </div>

      {/* Summary Stats */}
      {summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hours by Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.map((stat) => (
                <div key={stat.name} className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">{stat.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {stat.totalHours.toFixed(1)} hrs
                    </span>
                    <span className="text-slate-500 text-sm ml-3">
                      (avg {stat.avgHoursPerDay.toFixed(1)} hrs/day)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No time entries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Work Order</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Hours</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Break (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{row.employee_name}</td>
                      <td className="py-3 px-4">
                        {format(new Date(row.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-blue-600">{row.work_order_no}</span>
                      </td>
                      <td className="py-3 px-4">{row.customer_name}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {row.hours_worked.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right">{row.break_minutes}</td>
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
