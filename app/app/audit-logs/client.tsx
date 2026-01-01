'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuditLogEntry } from '@/lib/data/audit-logs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AuditLogTable } from '@/components/audit/audit-log-table'
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react'

interface AuditLogsClientProps {
  logs: AuditLogEntry[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export function AuditLogsClient({
  logs,
  totalCount,
  currentPage,
  pageSize,
}: AuditLogsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    table: searchParams.get('table') || '',
    action: searchParams.get('action') || '',
    record_id: searchParams.get('record_id') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (filters.table) params.set('table', filters.table)
    if (filters.action) params.set('action', filters.action)
    if (filters.record_id) params.set('record_id', filters.record_id)
    if (filters.start_date) params.set('start_date', filters.start_date)
    if (filters.end_date) params.set('end_date', filters.end_date)
    params.set('page', '1')

    router.push(`/app/audit-logs?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      table: '',
      action: '',
      record_id: '',
      start_date: '',
      end_date: '',
    })
    router.push('/app/audit-logs')
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/app/audit-logs?${params.toString()}`)
  }

  const exportToCSV = () => {
    // Helper function to escape CSV values according to RFC 4180
    const escapeCSV = (value: string): string => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const headers = ['Timestamp', 'Action', 'Table', 'User', 'Record ID', 'Changes', 'Reason']
    const rows = logs.map(log => [
      new Date(log.created_at).toISOString(),
      log.action,
      log.table_name,
      log.user_email || 'System',
      log.record_id,
      log.changed_fields?.join(', ') || '',
      log.reason || '',
    ])

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-gray-500 mt-1">
            Complete audit trail of all system changes
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={logs.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Table</label>
              <Select
                value={filters.table}
                onValueChange={(value) => setFilters({ ...filters, table: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tables</SelectItem>
                  <SelectItem value="job_cost_entries">job_cost_entries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters({ ...filters, action: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="INSERT">INSERT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Record ID</label>
              <Input
                placeholder="Search by record ID"
                value={filters.record_id}
                onChange={(e) => setFilters({ ...filters, record_id: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={applyFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Results ({totalCount} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogTable logs={logs} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
