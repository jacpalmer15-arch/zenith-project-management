'use client'

import { AuditLogEntry } from '@/lib/data/audit-logs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AuditDiffViewer } from './audit-diff-viewer'
import { format } from 'date-fns'
import { Calendar, User, FileText } from 'lucide-react'

interface AuditLogDetailModalProps {
  auditLog: AuditLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailModal({
  auditLog,
  open,
  onOpenChange,
}: AuditLogDetailModalProps) {
  if (!auditLog) return null

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Audit Log Details
            <Badge className={getActionColor(auditLog.action)}>
              {auditLog.action}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Timestamp</div>
                <div className="text-sm font-medium">
                  {format(new Date(auditLog.created_at), 'MMM d, yyyy h:mm:ss a')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">User</div>
                <div className="text-sm font-medium">
                  {auditLog.user_email || 'System'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Table</div>
                <div className="text-sm font-medium font-mono">{auditLog.table_name}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Record ID</div>
                <div className="text-sm font-medium font-mono text-xs">
                  {auditLog.record_id}
                </div>
              </div>
            </div>

            {auditLog.reason && (
              <div className="col-span-2 flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Reason</div>
                  <div className="text-sm">{auditLog.reason}</div>
                </div>
              </div>
            )}
          </div>

          {/* Changed Fields */}
          {auditLog.changed_fields && auditLog.changed_fields.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-2">Changed Fields</h3>
              <div className="flex flex-wrap gap-2">
                {auditLog.changed_fields.map(field => (
                  <Badge key={field} variant="secondary" className="font-mono text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Diff View for Updates */}
          {auditLog.action === 'UPDATE' && auditLog.old_values && auditLog.new_values && (
            <div>
              <h3 className="font-medium text-sm mb-3">Changes</h3>
              <AuditDiffViewer
                oldValues={auditLog.old_values}
                newValues={auditLog.new_values}
                changedFields={auditLog.changed_fields}
              />
            </div>
          )}

          {/* New Values for Insert */}
          {auditLog.action === 'INSERT' && auditLog.new_values && (
            <div>
              <h3 className="font-medium text-sm mb-3">Created Values</h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(auditLog.new_values, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Old Values for Delete */}
          {auditLog.action === 'DELETE' && auditLog.old_values && (
            <div>
              <h3 className="font-medium text-sm mb-3">Deleted Values</h3>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(auditLog.old_values, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
