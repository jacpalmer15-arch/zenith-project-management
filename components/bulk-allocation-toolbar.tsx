'use client'

import { useState, useEffect } from 'react'
import { bulkAllocateReceipts } from '@/app/actions/receipts'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CostCode, CostType } from '@/lib/db'

interface WorkOrder {
  id: string
  work_order_no: string
  summary: string
}

interface BulkAllocationToolbarProps {
  selectedIds: string[]
  costTypes: CostType[]
  costCodes: CostCode[]
  onClearSelection?: () => void
}

export function BulkAllocationToolbar({ 
  selectedIds, 
  costTypes,
  costCodes,
  onClearSelection 
}: BulkAllocationToolbarProps) {
  const [workOrderId, setWorkOrderId] = useState<string>('')
  const [costTypeId, setCostTypeId] = useState<string>('')
  const [costCodeId, setCostCodeId] = useState<string>('')
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const availableCostCodes = costTypeId
    ? costCodes.filter((code) => code.cost_type_id === costTypeId)
    : costCodes
  
  useEffect(() => {
    // Fetch active work orders
    fetch('/api/work-orders?status=SCHEDULED,IN_PROGRESS')
      .then(res => res.json())
      .then(data => setWorkOrders(data || []))
      .catch(err => console.error('Failed to load work orders:', err))
  }, [])
  
  const handleBulkAllocate = async () => {
    if (selectedIds.length === 0 || !workOrderId || !costTypeId || !costCodeId) return
    
    setIsLoading(true)
    const result = await bulkAllocateReceipts(
      selectedIds,
      workOrderId,
      costTypeId,
      costCodeId
    )
    setIsLoading(false)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Allocated ${result.allocated} receipts`)
      setWorkOrderId('')
      setCostTypeId('')
      setCostCodeId('')
      if (onClearSelection) {
        onClearSelection()
      }
    }
  }
  
  if (selectedIds.length === 0) {
    return null
  }
  
  return (
    <div className="flex items-center gap-4 p-4 border-t bg-slate-50">
      <span className="text-sm text-slate-600 font-medium">
        {selectedIds.length} selected
      </span>
      
      <Select value={workOrderId} onValueChange={setWorkOrderId}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select work order..." />
        </SelectTrigger>
        <SelectContent>
          {workOrders.map((wo) => (
            <SelectItem key={wo.id} value={wo.id}>
              {wo.work_order_no} - {wo.summary}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={costTypeId} onValueChange={(value) => {
        setCostTypeId(value)
        setCostCodeId('')
      }}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Cost type..." />
        </SelectTrigger>
        <SelectContent>
          {costTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={costCodeId} onValueChange={setCostCodeId} disabled={!costTypeId}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Cost code..." />
        </SelectTrigger>
        <SelectContent>
          {availableCostCodes.map((code) => (
            <SelectItem key={code.id} value={code.id}>
              {code.code} - {code.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        onClick={handleBulkAllocate}
        disabled={selectedIds.length === 0 || !workOrderId || !costTypeId || !costCodeId || isLoading}
      >
        {isLoading ? 'Allocating...' : 'Allocate Selected'}
      </Button>
    </div>
  )
}
