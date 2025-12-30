'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { CSVColumn, generateCSV, downloadCSV } from '@/lib/utils/csv-export'

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
      // Convert columns to CSV format and call generateCSV
      const csv = generateCSV(data, columns)
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
