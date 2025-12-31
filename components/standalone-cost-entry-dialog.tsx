'use client'

import { useState, useEffect } from 'react'
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
import { createCostEntryAction } from '@/app/actions/cost-entries'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const COST_BUCKETS = [
  { value: 'LABOR', label: 'Labor' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'SUB', label: 'Subcontractor' },
  { value: 'OVERHEAD', label: 'Overhead' },
  { value: 'OTHER', label: 'Other' },
]

interface WorkOrder {
  id: string
  work_order_no: string
  summary: string
}

interface StandaloneCostEntryDialogProps {
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost'
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
}

export function StandaloneCostEntryDialog({ 
  buttonVariant = 'default',
  buttonSize = 'default'
}: StandaloneCostEntryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [workOrderId, setWorkOrderId] = useState<string>('')
  const [bucket, setBucket] = useState<string>('MATERIAL')
  const [description, setDescription] = useState('')
  const [qty, setQty] = useState('1')
  const [unitCost, setUnitCost] = useState('')
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().split('T')[0]
  )

  const totalCost = (parseFloat(qty) || 0) * (parseFloat(unitCost) || 0)

  // Fetch work orders when dialog opens
  useEffect(() => {
    if (open) {
      fetch('/api/work-orders?status=SCHEDULED,IN_PROGRESS,COMPLETED')
        .then(res => res.json())
        .then(data => setWorkOrders(data || []))
        .catch(err => console.error('Failed to load work orders:', err))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workOrderId) {
      toast.error('Please select a work order')
      return
    }
    
    setLoading(true)

    try {
      const result = await createCostEntryAction({
        work_order_id: workOrderId,
        bucket,
        origin: 'ZENITH_CAPTURED',
        description,
        qty: parseFloat(qty) || 1,
        unit_cost: parseFloat(unitCost) || 0,
        total_cost: totalCost,
        occurred_at: occurredAt,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to create cost entry')
        return
      }

      toast.success('Job cost added successfully')
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create cost entry')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setWorkOrderId('')
    setBucket('MATERIAL')
    setDescription('')
    setQty('1')
    setUnitCost('')
    setOccurredAt(new Date().toISOString().split('T')[0])
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize}>
            <Plus className="h-4 w-4 mr-2" />
            Add Job Cost
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Job Cost</DialogTitle>
              <DialogDescription>
                Manually add a cost entry to a work order.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="workOrder">Work Order *</Label>
                <Select value={workOrderId} onValueChange={setWorkOrderId}>
                  <SelectTrigger id="workOrder">
                    <SelectValue placeholder="Select work order..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workOrders.length === 0 ? (
                      <SelectItem value="" disabled>
                        No work orders available
                      </SelectItem>
                    ) : (
                      workOrders.map((wo) => (
                        <SelectItem key={wo.id} value={wo.id}>
                          {wo.work_order_no} - {wo.summary?.slice(0, 40)}{wo.summary?.length > 40 ? '...' : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
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
                <Label htmlFor="description">Description *</Label>
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
                  <Label htmlFor="unitCost">Unit Cost ($) *</Label>
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
              <Button type="submit" disabled={loading || !workOrderId}>
                {loading ? 'Adding...' : 'Add Cost'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
