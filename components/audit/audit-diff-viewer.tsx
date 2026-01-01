'use client'

import { Badge } from '@/components/ui/badge'

interface AuditDiffViewerProps {
  oldValues: any
  newValues: any
  changedFields?: string[]
}

export function AuditDiffViewer({ oldValues, newValues, changedFields }: AuditDiffViewerProps) {
  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ])

  // Filter to only changed fields if provided
  const keysToShow = changedFields && changedFields.length > 0
    ? Array.from(allKeys).filter(key => changedFields.includes(key))
    : Array.from(allKeys)

  // Skip internal fields
  const filteredKeys = keysToShow.filter(
    key => !['id', 'created_at', 'updated_at', 'created_by'].includes(key)
  )

  if (filteredKeys.length === 0) {
    return <div className="text-sm text-gray-500">No changes detected</div>
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  return (
    <div className="space-y-3">
      {filteredKeys.map(key => {
        const oldVal = oldValues?.[key]
        const newVal = newValues?.[key]
        const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal)

        return (
          <div key={key} className="border rounded-lg p-3">
            <div className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
              <span className="font-mono">{key}</span>
              {hasChanged && <Badge variant="outline" className="text-xs">Changed</Badge>}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Old Value</div>
                <div className={`p-2 rounded ${hasChanged ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {formatValue(oldVal)}
                  </pre>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">New Value</div>
                <div className={`p-2 rounded ${hasChanged ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {formatValue(newVal)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
