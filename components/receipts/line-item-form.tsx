'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { createLineItemAction, updateLineItemAction } from '@/app/actions/receipts'
import type { ReceiptLineItem, Part } from '@/lib/db'

interface LineItemFormProps {
  receiptId: string
  lineItem?: ReceiptLineItem
  parts: Part[]
}

export function LineItemForm({ receiptId, lineItem, parts }: LineItemFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [qty, setQty] = useState(lineItem?.qty?.toString() || '1')
  const [unitCost, setUnitCost] = useState(lineItem?.unit_cost?.toString() || '0')
  
  // Calculate amount in real-time
  const amount = (parseFloat(qty) || 0) * (parseFloat(unitCost) || 0)
  
  async function handleSubmit(formData: FormData) {
    setError(null)
    
    startTransition(async () => {
      const result = lineItem
        ? await updateLineItemAction(lineItem.id, formData)
        : await createLineItemAction(formData)
      
      if (result?.error) {
        setError(result.error)
      } else {
        router.push(`/app/receipts/${receiptId}`)
        router.refresh()
      }
    })
  }
  
  return (
    <form action={handleSubmit}>
      <input type="hidden" name="receipt_id" value={receiptId} />
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={lineItem?.description || ''}
              required
              placeholder="What was purchased?"
              rows={2}
            />
          </div>
          
          {/* Part Selection (optional) */}
          <div>
            <Label htmlFor="part_id">Part (optional)</Label>
            <Select name="part_id" defaultValue={lineItem?.part_id || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select a part from catalog" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {parts.map((part) => (
                  <SelectItem key={part.id} value={part.id}>
                    {part.sku ? `${part.sku} - ` : ''}{part.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quantity and Unit of Measure */}
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
              <Label htmlFor="uom">Unit of Measure</Label>
              <Input
                type="text"
                id="uom"
                name="uom"
                defaultValue={lineItem?.uom || ''}
                placeholder="ea, ft, lb, etc."
              />
            </div>
          </div>
          
          {/* Unit Cost */}
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
          
          {/* Calculated Amount (read-only) */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Line Total:</span>
              <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {qty} × ${unitCost} = ${amount.toFixed(2)}
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : lineItem ? 'Update Line Item' : 'Add Line Item'}
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
