import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { AuditLog } from '@/lib/data/audit-logs'

interface ActivityFeedProps {
  entries: AuditLog[]
  emptyMessage?: string
}

export function ActivityFeed({ entries, emptyMessage }: ActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        {emptyMessage || 'No activity yet.'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{entry.action}</Badge>
              <span className="text-sm text-slate-600">{entry.entity_type}</span>
            </div>
            {entry.notes && (
              <p className="text-sm text-slate-700 mt-2">{entry.notes}</p>
            )}
            {entry.actor_user_id && (
              <p className="text-xs text-slate-500 mt-2">Actor: {entry.actor_user_id}</p>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  )
}
