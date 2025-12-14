'use client'

import { useState } from 'react'
import { useFieldArray, Control, UseFormWatch, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'
import { PartsSelectorDialog } from './parts-selector-dialog'
import type { Part } from '@/lib/db'

export interface QuoteLineItemFormData {
  id?: string
  part_id?: string | null
  description: string
  uom: string
  qty: number
  unit_price: number
  is_taxable: boolean
  line_no: number
}

interface QuoteLineItemsProps {
  control: Control<any>
  watch: UseFormWatch<any>
  taxRate: number
  parts: Part[]
  readOnly?: boolean
}

export function QuoteLineItems({
  control,
  watch,
  taxRate,
  parts,
  readOnly = false,
}: QuoteLineItemsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  })

  const [isPartsDialogOpen, setIsPartsDialogOpen] = useState(false)

  const lines = watch('lines') || []

  // Calculate totals
  const subtotal = lines.reduce((sum: number, line: QuoteLineItemFormData) => {
    return sum + (line.qty * line.unit_price)
  }, 0)

  const taxableSubtotal = lines.reduce((sum: number, line: QuoteLineItemFormData) => {
    if (line.is_taxable) {
      return sum + (line.qty * line.unit_price)
    }
    return sum
  }, 0)

  const taxAmount = taxableSubtotal * taxRate
  const grandTotal = subtotal + taxAmount

  const addCustomLine = () => {
    append({
      part_id: null,
      description: '',
      uom: 'EA',
      qty: 1,
      unit_price: 0,
      is_taxable: true,
      line_no: fields.length + 1,
    })
  }

  const addPartLine = (part: Part) => {
    append({
      part_id: part.id,
      description: part.description_default || part.name,
      uom: part.uom,
      qty: 1,
      unit_price: part.sell_price,
      is_taxable: part.is_taxable,
      line_no: fields.length + 1,
    })
  }

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">UOM</TableHead>
                <TableHead className="w-24 text-right">Qty</TableHead>
                <TableHead className="w-32 text-right">Unit Price</TableHead>
                <TableHead className="w-24 text-center">Taxable</TableHead>
                <TableHead className="w-32 text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500">
                    No line items
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line: QuoteLineItemFormData, index: number) => {
                  const lineTotal = line.qty * line.unit_price
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{line.description}</TableCell>
                      <TableCell>{line.uom}</TableCell>
                      <TableCell className="text-right">{line.qty}</TableCell>
                      <TableCell className="text-right">
                        ${line.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {line.is_taxable ? '✓' : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        ${lineTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Tax ({(taxRate * 100).toFixed(2)}%):
              </span>
              <span className="font-medium">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Line Items Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">UOM</TableHead>
              <TableHead className="w-24">Qty</TableHead>
              <TableHead className="w-32">Unit Price</TableHead>
              <TableHead className="w-24 text-center">Taxable</TableHead>
              <TableHead className="w-32 text-right">Line Total</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500">
                  No line items. Click &quot;Add Custom Line&quot; or &quot;Add from Parts&quot; to add items.
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field, index) => {
                const line = lines[index] || field
                const lineTotal = (line.qty || 0) * (line.unit_price || 0)
                
                return (
                  <TableRow key={field.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Input
                        {...control.register(`lines.${index}.description`)}
                        placeholder="Description"
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        {...control.register(`lines.${index}.uom`)}
                        placeholder="UOM"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        {...control.register(`lines.${index}.qty`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        {...control.register(`lines.${index}.unit_price`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Controller
                          control={control}
                          name={`lines.${index}.is_taxable`}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${lineTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Line Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={addCustomLine}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Custom Line
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPartsDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add from Parts
        </Button>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="max-w-md ml-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              Tax ({(taxRate * 100).toFixed(2)}%):
            </span>
            <span className="font-medium">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Parts Selector Dialog */}
      <PartsSelectorDialog
        open={isPartsDialogOpen}
        onOpenChange={setIsPartsDialogOpen}
        onSelect={addPartLine}
        parts={parts}
      />
    </div>
  )
}
