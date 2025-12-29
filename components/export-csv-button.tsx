'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface ExportCsvButtonProps {
  data: any[]
  filename: string
  columns: { key: string; label: string }[]
  disabled?: boolean
}

/**
 * Reusable CSV export button
 */
export function ExportCsvButton({
  data,
  filename,
  columns,
  disabled = false,
}: ExportCsvButtonProps) {
  const handleExport = () => {
    if (data.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      // Create CSV header
      const headers = columns.map((col) => col.label).join(',')

      // Create CSV rows
      const rows = data.map((row) =>
        columns
          .map((col) => {
            const value = row[col.key]
            // Escape quotes and wrap in quotes if contains comma or quote
            const stringValue = value != null ? String(value) : ''
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          })
          .join(',')
      )

      // Combine header and rows
      const csv = [headers, ...rows].join('\n')

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Exported ${data.length} rows to ${filename}.csv`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export CSV')
    }
  }

  return (
    <Button onClick={handleExport} disabled={disabled || data.length === 0} variant="outline">
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  )
}
