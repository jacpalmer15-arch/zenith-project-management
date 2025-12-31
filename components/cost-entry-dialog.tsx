'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { createJobCostEntryAction } from '@/app/actions/cost-entries'
import { useRouter } from 'next/navigation'
import { showActionResult } from '@/components/action-error-toast'

const COST_BUCKETS = [
  { value: 'LABOR', label: 'Labor' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'SUB', label: 'Subcontractor' },
  { value: 'OVERHEAD', label: 'Overhead' },
  { value: 'OTHER', label: 'Other' },
]

interface CostEntryDialogProps {
  workOrderId: string
}

export function CostEntryDialog({ workOrderId }: CostEntryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [bucket, setBucket] = useState<string>('MATERIAL')
  const [description, setDescription] = useState('')
  const [qty, setQty] = useState('1')
  const [unitCost, setUnitCost] = useState('')
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().split('T')[0]
  )

  const totalCost = (parseFloat(qty) || 0) * (parseFloat(unitCost) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await createJobCostEntryAction({
      work_order_id: workOrderId,
      bucket,
      origin: 'ZENITH_CAPTURED',
      description,
      qty: parseFloat(qty) || 1,
      unit_cost: parseFloat(unitCost) || 0,
      total_cost: totalCost,
      occurred_at: occurredAt,
    })

    showActionResult(result, {
      successMessage: 'Cost entry added successfully',
      onSuccess: () => {
        setOpen(false)
        resetForm()
        router.refresh()
      }
    })

    setLoading(false)
  }

  const resetForm = () => {
    setBucket('MATERIAL')
    setDescription('')
    setQty('1')
    setUnitCost('')
    setOccurredAt(new Date().toISOString().split('T')[0])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Cost
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Cost Entry</DialogTitle>
              <DialogDescription>
                Manually add a cost to this work order.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="bucket">Cost Bucket</Label>
                <Select value={bucket} onValueChange={setBucket}>
                  <SelectTrigger id="bucket">
                    <SelectValue placeholder="Select bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    {COST_BUCKETS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the cost..."
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="occurredAt">Date</Label>
                <Input
                  id="occurredAt"
                  type="date"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input
                    id="qty"
                    type="number"
                    step="0.01"
                    min="0"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="unitCost">Unit Cost ($)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3 text-right">
                <span className="text-sm text-slate-600 mr-2">Total:</span>
                <span className="text-lg font-semibold text-slate-900">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Cost'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  )
}
