'use client'

import { useState } from 'react'
import { AuditLogEntry } from '@/lib/data/audit-logs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AuditLogDetailModal } from './audit-log-detail-modal'
import { format } from 'date-fns'
import { formatDistanceToNow } from 'date-fns'
import { Eye } from 'lucide-react'

interface AuditLogTableProps {
  logs: AuditLogEntry[]
  showTable?: boolean
}

export function AuditLogTable({ logs, showTable = true }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setIsModalOpen(true)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatChangeSummary = (log: AuditLogEntry) => {
    if (log.action === 'INSERT') {
      return 'Record created'
    }
    if (log.action === 'DELETE') {
      return 'Record deleted'
    }
    if (log.action === 'UPDATE' && log.changed_fields) {
      const count = log.changed_fields.length
      const preview = log.changed_fields.slice(0, 3).join(', ')
      return count > 3 ? `${preview}, +${count - 3} more` : preview
    }
    return 'Updated'
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No audit logs found
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            {showTable && <TableHead>Table</TableHead>}
            <TableHead>User</TableHead>
            <TableHead>Changes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {format(new Date(log.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(log.created_at), 'h:mm a')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getActionColor(log.action)}>
                  {log.action}
                </Badge>
              </TableCell>
              {showTable && (
                <TableCell>
                  <span className="font-mono text-sm">{log.table_name}</span>
                </TableCell>
              )}
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {log.user_email || 'System'}
                  </div>
                  {log.user_id && (
                    <div className="text-xs text-gray-500 font-mono">
                      {log.user_id.substring(0, 8)}...
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm max-w-xs">
                  {formatChangeSummary(log)}
                  {log.reason && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      "{log.reason}"
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(log)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AuditLogDetailModal
        auditLog={selectedLog}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
