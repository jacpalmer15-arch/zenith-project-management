'use client'

import { useState, useTransition, useEffect } from 'react'
import { closeWorkOrder } from '@/app/actions/work-orders'
import { validateWorkOrderClose } from '@/lib/workflows/work-order-closeout'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface WorkOrderCloseoutDialogProps {
  workOrderId: string
  trigger?: React.ReactNode
}

export function WorkOrderCloseoutDialog({
  workOrderId,
  trigger,
}: WorkOrderCloseoutDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<{
    canClose: boolean
    issues: string[]
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  
  // Validate when dialog opens
  useEffect(() => {
    if (isOpen && !validation) {
      setIsValidating(true)
      validateWorkOrderClose(workOrderId)
        .then(result => {
          setValidation({
            canClose: result.canClose,
            issues: result.issues,
          })
        })
        .catch(err => {
          setError('Failed to validate work order')
          console.error('Validation error:', err)
        })
        .finally(() => {
          setIsValidating(false)
        })
    }
  }, [isOpen, workOrderId, validation])
  
  const handleClose = () => {
    if (!reason.trim()) {
      setError('Reason is required to close work order')
      return
    }
    
    setError(null)
    startTransition(async () => {
      const result = await closeWorkOrder(workOrderId, reason)
      
      if (result.error) {
        setError(result.error)
        // Check if issues are present in the result
        if ('issues' in result && result.issues) {
          setValidation({
            canClose: false,
            issues: result.issues,
          })
        }
      } else {
        setIsOpen(false)
        setReason('')
        setValidation(null)
      }
    })
  }
  
  const handleCancel = () => {
    setIsOpen(false)
    setReason('')
    setError(null)
    setValidation(null)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Close Work Order</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Close Work Order</DialogTitle>
          <DialogDescription>
            Review the checklist below before closing this work order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isValidating && (
            <div className="flex items-center gap-2 text-slate-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              <span className="text-sm">Validating work order...</span>
            </div>
          )}
          
          {validation && (
            <div className="space-y-2">
              <div className="font-medium text-sm text-slate-700">
                Close-out Checklist:
              </div>
              
              {validation.canClose ? (
                <div className="flex items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    All requirements met. Work order can be closed.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <div className="font-medium mb-1">Cannot close work order:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validation.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="close-reason">Reason for Closing</Label>
            <Textarea
              id="close-reason"
              placeholder="Enter reason for closing this work order..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={!validation?.canClose || isPending}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={
              !validation?.canClose ||
              !reason.trim() ||
              isPending ||
              isValidating
            }
          >
            {isPending ? 'Closing...' : 'Close Work Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
