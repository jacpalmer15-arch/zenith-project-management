'use client'

import { useState, useTransition } from 'react'
import { WorkStatus } from '@/lib/db'
import { getAllowedTransitions, requiresReason } from '@/lib/workflows/transitions'
import { updateWorkOrderStatusAction } from '@/app/actions/work-orders'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronDown } from 'lucide-react'
import { WorkOrderStatusBadge } from './work-order-status-badge'

interface WorkOrderStatusDropdownProps {
  workOrderId: string
  currentStatus: WorkStatus
}

export function WorkOrderStatusDropdown({
  workOrderId,
  currentStatus,
}: WorkOrderStatusDropdownProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<WorkStatus | null>(null)
  const [reason, setReason] = useState('')
  
  const allowedTransitions = getAllowedTransitions(currentStatus)
  
  const handleStatusChange = (newStatus: WorkStatus) => {
    setError(null)
    
    // Check if reason is required
    if (requiresReason(currentStatus, newStatus)) {
      setSelectedStatus(newStatus)
      setShowReasonDialog(true)
      return
    }
    
    // Otherwise, transition immediately
    performTransition(newStatus)
  }
  
  const performTransition = (newStatus: WorkStatus, transitionReason?: string) => {
    startTransition(async () => {
      const result = await updateWorkOrderStatusAction(
        workOrderId,
        newStatus,
        transitionReason
      )
      
      if (result.error) {
        setError(result.error)
      } else {
        setShowReasonDialog(false)
        setReason('')
        setSelectedStatus(null)
      }
    })
  }
  
  const handleReasonSubmit = () => {
    if (!selectedStatus) return
    
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }
    
    performTransition(selectedStatus, reason)
  }
  
  const handleReasonCancel = () => {
    setShowReasonDialog(false)
    setReason('')
    setSelectedStatus(null)
    setError(null)
  }
  
  if (allowedTransitions.length === 0) {
    return <WorkOrderStatusBadge status={currentStatus} />
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={isPending}>
            <WorkOrderStatusBadge status={currentStatus} />
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {allowedTransitions.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
            >
              <WorkOrderStatusBadge status={status} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {error && (
        <div className="text-sm text-red-600 mt-2">
          {error}
        </div>
      )}
      
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status Change Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for changing the status to{' '}
              {selectedStatus && <WorkOrderStatusBadge status={selectedStatus} />}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleReasonCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReasonSubmit}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
