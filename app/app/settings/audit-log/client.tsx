'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AuditLog } from '@/lib/data/audit-logs'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface AuditLogClientProps {
  initialData: AuditLog[]
}

export function AuditLogClient({ initialData }: AuditLogClientProps) {
  const [data] = useState(initialData)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-slate-500 mt-1">System activity and changes</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entity_type">Entity Type</Label>
              <Input id="entity_type" placeholder="e.g., quote, work_order" />
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Input id="action" placeholder="e.g., CREATE, UPDATE" />
            </div>
            <div>
              <Label htmlFor="date_range">Date Range</Label>
              <Input id="date_range" type="date" />
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm">Apply Filters</Button>
            <Button size="sm" variant="outline" className="ml-2">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No audit logs found.</p>
              <p className="text-sm text-slate-400 mt-1">
                Audit logs will appear here as actions are performed in the system.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((log) => {
                const isExpanded = expandedRows.has(log.id)
                return (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleRow(log.id)}
                    >
                      <button className="text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Timestamp</p>
                          <p className="text-sm font-medium">
                            {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Entity</p>
                          <p className="text-sm font-medium">{log.entity_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Action</p>
                          <p className="text-sm">
                            <span className="px-2 py-1 text-xs rounded bg-slate-100">
                              {log.action}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Actor</p>
                          <p className="text-sm font-medium truncate">
                            {log.actor_user_id ? log.actor_user_id.substring(0, 8) + '...' : 'System'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-slate-200 p-4 bg-slate-50">
                        {log.notes && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-slate-700 mb-1">Notes:</p>
                            <p className="text-sm text-slate-600">{log.notes}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          {log.before_data && (
                            <div>
                              <p className="text-xs font-medium text-slate-700 mb-2">Before:</p>
                              <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-auto max-h-48">
                                {JSON.stringify(log.before_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.after_data && (
                            <div>
                              <p className="text-xs font-medium text-slate-700 mb-2">After:</p>
                              <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-auto max-h-48">
                                {JSON.stringify(log.after_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
