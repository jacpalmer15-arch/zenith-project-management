'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteLineItemAction } from '@/app/actions/receipts'
import { toast } from 'sonner'

interface DeleteLineItemButtonProps {
  lineItemId: string
  receiptId: string
  disabled?: boolean
}

export function DeleteLineItemButton({ lineItemId, receiptId, disabled }: DeleteLineItemButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteLineItemAction(lineItemId, receiptId)
      
      if (result?.error) {
        toast.error('Error', {
          description: result.error,
        })
      } else {
        toast.success('Line item deleted successfully')
      }
      
      setOpen(false)
      router.refresh()
    })
  }
  
  if (disabled) {
    return (
      <Button 
        size="sm" 
        variant="ghost" 
        disabled 
        title="Cannot delete - line has allocations"
        className="opacity-40 cursor-not-allowed"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    )
  }
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Trash2 className="w-3 h-3 text-red-600" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Line Item?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this line item. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
