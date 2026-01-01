'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { exportJobCostsCSV } from '@/app/actions/reports'
import { toast } from 'sonner'

interface ExportCostsButtonProps {
  targetType: 'project' | 'work_order'
  targetId: string
  targetName: string | null
}

export function ExportCostsButton({ targetType, targetId, targetName }: ExportCostsButtonProps) {
  const [isPending, startTransition] = useTransition()
  
  const handleExport = async () => {
    startTransition(async () => {
      try {
        const csv = await exportJobCostsCSV(targetType, targetId)
        
        // Create a blob and download
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const date = new Date().toISOString().split('T')[0]
        a.download = `${targetType}-${targetName || 'report'}-costs-${date}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success('CSV exported successfully')
      } catch (error) {
        console.error('Failed to export CSV:', error)
        toast.error('Failed to export CSV')
      }
    })
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  )
}
