'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { generateCSV, downloadCSV } from '@/lib/utils/csv-export'

interface CSVColumn<T> {
  key: string
  label: string
  format?: (value: any, row: T) => string
}

interface ExportCsvButtonProps<T = any> {
  data: T[]
  filename: string
  columns: CSVColumn<T>[]
  disabled?: boolean
}

/**
 * Reusable CSV export button
 */
export function ExportCsvButton<T extends Record<string, any>>({
  data,
  filename,
  columns,
  disabled = false,
}: ExportCsvButtonProps<T>) {
  const handleExport = () => {
    if (data.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      // Convert columns to CSV format
      const csvColumns = columns.map(col => ({
        key: col.key,
        header: col.label,
        format: col.format
      }))
      
      const csv = generateCSV(data, csvColumns)
      downloadCSV(`${filename}.csv`, csv)
      
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
