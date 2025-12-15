'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail } from 'lucide-react'
import { sendQuoteEmail } from '@/app/actions/send-quote-email'
import { toast } from 'sonner'

interface SendQuoteEmailButtonProps {
  quoteId: string
  quoteNo: string
  customerName: string
  customerEmail: string | null | undefined
  status: string
}

export function SendQuoteEmailButton({
  quoteId,
  quoteNo,
  customerName,
  customerEmail,
  status,
}: SendQuoteEmailButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = async () => {
    setIsSending(true)
    
    try {
      const result = await sendQuoteEmail(quoteId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message || 'Quote sent successfully!')
        setIsOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to send email')
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  // Check if email can be sent
  if (!customerEmail) {
    return (
      <Button 
        variant="outline"
        disabled
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        Send Email
      </Button>
    )
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        Send Email
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote via Email</DialogTitle>
            <DialogDescription>
              This will send Quote #{quoteNo} to the customer with a PDF attachment.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Customer:</p>
              <p className="text-sm text-slate-600">{customerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Email:</p>
              <p className="text-sm text-slate-600">{customerEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Quote Number:</p>
              <p className="text-sm text-slate-600">#{quoteNo}</p>
            </div>
            {status === 'Draft' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The quote status will automatically change from Draft to Sent after sending.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
