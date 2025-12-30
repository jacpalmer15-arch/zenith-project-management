'use client'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface AdminOverrideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: (reason: string) => void
}

export function AdminOverrideDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm
}: AdminOverrideDialogProps) {
  const [reason, setReason] = useState('')
  
  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim())
      setReason('')
    }
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 py-4">
          <Label htmlFor="reason">Reason for override (required)</Label>
          <Textarea
            id="reason"
            placeholder="Enter reason for this change..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason('')}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirm Override
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
