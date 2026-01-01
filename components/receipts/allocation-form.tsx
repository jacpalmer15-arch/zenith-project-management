'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { createAllocationAction } from '@/app/actions/job-costs'
import type { Project, WorkOrder, CostType, CostCode } from '@/lib/db'

interface AllocationFormProps {
  receiptId: string
  receiptLineItemId: string
  unallocatedTotal: number
  projects: Project[]
  workOrders: WorkOrder[]
  costTypes: CostType[]
  costCodes: CostCode[]
}

export function AllocationForm({
  receiptId,
  receiptLineItemId,
  unallocatedTotal,
  projects,
  workOrders,
  costTypes,
  costCodes,
}: AllocationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [ownerType, setOwnerType] = useState<'project' | 'work_order'>('project')
  const [ownerId, setOwnerId] = useState<string>('')
  const [costTypeId, setCostTypeId] = useState<string>('')
  const [costCodeId, setCostCodeId] = useState<string>('')
  const [qty, setQty] = useState('1')
  const [unitCost, setUnitCost] = useState('0')
  
  // Calculate amount in real-time
  const amount = (parseFloat(qty) || 0) * (parseFloat(unitCost) || 0)
  
  // Filter cost codes based on selected cost type
  const filteredCostCodes = costTypeId 
    ? costCodes.filter(cc => cc.cost_type_id === costTypeId)
    : costCodes
  
  // Reset cost code when cost type changes
  useEffect(() => {
    if (costTypeId) {
      const isValidCostCode = filteredCostCodes.some(cc => cc.id === costCodeId)
      if (!isValidCostCode) {
        setCostCodeId('')
      }
    }
  }, [costTypeId, costCodeId, filteredCostCodes])
  
  // Validation state
  const isOverAllocating = amount > unallocatedTotal
  const isValid = amount > 0 && amount <= unallocatedTotal && ownerId && costTypeId && costCodeId
  
  async function handleSubmit(formData: FormData) {
    setError(null)
    
    startTransition(async () => {
      const result = await createAllocationAction(formData)
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.refresh()
        // Reset form
        setOwnerId('')
        setCostCodeId('')
        setQty('1')
        setUnitCost('0')
      }
    })
  }
  
  return (
    <form action={handleSubmit}>
      <input type="hidden" name="receipt_id" value={receiptId} />
      <input type="hidden" name="receipt_line_item_id" value={receiptLineItemId} />
      <input type="hidden" name="owner_type" value={ownerType} />
      <input type="hidden" name="owner_id" value={ownerId} />
      <input type="hidden" name="cost_type_id" value={costTypeId} />
      <input type="hidden" name="cost_code_id" value={costCodeId} />
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Remaining Amount Display */}
          <div className={`p-4 rounded-lg ${
            isOverAllocating ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Remaining Unallocated:</span>
              <span className="text-2xl font-bold">
                ${unallocatedTotal.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Owner Type: Project vs Work Order */}
          <div>
            <Label>Allocate To *</Label>
            <RadioGroup 
              value={ownerType} 
              onValueChange={(value) => {
                setOwnerType(value as 'project' | 'work_order')
                setOwnerId('') // Reset owner when type changes
              }}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="project" id="project" />
                <Label htmlFor="project" className="font-normal cursor-pointer">
                  Project
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work_order" id="work_order" />
                <Label htmlFor="work_order" className="font-normal cursor-pointer">
                  Work Order
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Project or Work Order Selector */}
          <div>
            <Label htmlFor="owner">
              {ownerType === 'project' ? 'Project' : 'Work Order'} *
            </Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select a ${ownerType === 'project' ? 'project' : 'work order'}`} />
              </SelectTrigger>
              <SelectContent>
                {ownerType === 'project' ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_no ? `${project.project_no} - ` : ''}{project.name}
                    </SelectItem>
                  ))
                ) : (
                  workOrders.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      {wo.work_order_no ? `${wo.work_order_no} - ` : ''}{wo.summary}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Cost Type */}
          <div>
            <Label htmlFor="cost_type">Cost Type *</Label>
            <Select value={costTypeId} onValueChange={setCostTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select cost type" />
              </SelectTrigger>
              <SelectContent>
                {costTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Cost Code (filtered by cost type) */}
          <div>
            <Label htmlFor="cost_code">Cost Code *</Label>
            <Select 
              value={costCodeId} 
              onValueChange={setCostCodeId}
              disabled={!costTypeId}
            >
              <SelectTrigger>
                <SelectValue placeholder={costTypeId ? "Select cost code" : "Select cost type first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredCostCodes.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quantity and Unit Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qty">Quantity *</Label>
              <Input
                type="number"
                id="qty"
                name="qty"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_cost">Unit Cost *</Label>
              <Input
                type="number"
                id="unit_cost"
                name="unit_cost"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          
          {/* Description (optional) */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Additional notes about this allocation"
              rows={2}
            />
          </div>
          
          {/* Calculated Amount with Validation */}
          <div className={`p-4 rounded-lg ${
            isOverAllocating 
              ? 'bg-red-50 border-2 border-red-500' 
              : amount > 0 
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Allocation Amount:</span>
              <span className={`text-2xl font-bold ${
                isOverAllocating ? 'text-red-600' : amount > 0 ? 'text-green-600' : 'text-slate-900'
              }`}>
                ${amount.toFixed(2)}
              </span>
            </div>
            <p className="text-sm mt-1 text-slate-600">
              {qty} × ${unitCost} = ${amount.toFixed(2)}
            </p>
            {isOverAllocating && (
              <p className="text-sm text-red-600 font-medium mt-2">
                ⚠️ Cannot allocate ${amount.toFixed(2)}. Only ${unallocatedTotal.toFixed(2)} remaining.
              </p>
            )}
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isPending || !isValid}
              className={isValid ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isPending ? 'Creating...' : 'Create Allocation'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
