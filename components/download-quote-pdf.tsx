'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { generateQuotePDF } from '@/app/actions/generate-pdf'
import { toast } from 'sonner'

interface DownloadQuotePDFProps {
  quoteId: string
  quoteNo: string
}

export function DownloadQuotePDF({ quoteId, quoteNo }: DownloadQuotePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    
    try {
      const result = await generateQuotePDF(quoteId)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.pdf) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.pdf)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.filename || `${quoteNo}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success('PDF downloaded successfully')
      }
    } catch (error) {
      toast.error('Failed to download PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isGenerating}
      variant="outline"
    >
      <Download className="mr-2 h-4 w-4" />
      {isGenerating ? 'Generating PDF...' : 'Download PDF'}
    </Button>
  )
}
