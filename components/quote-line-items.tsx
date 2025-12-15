'use client'

import { useEffect, useRef } from 'react'
import {
  useFieldArray,
  Control,
  UseFormWatch,
  Controller,
  UseFormSetValue,
  UseFormGetValues,
} from 'react-hook-form'
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
import type { Part } from '@/lib/db'
import { PartsLookupInput } from './parts-lookup-input'

export interface QuoteLineItemFormData {
  id?: string
  part_id?: string | null
  sku?: string | null
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
  setValue: UseFormSetValue<any>
  getValues: UseFormGetValues<any>
  taxRate: number
  parts: Part[]
  readOnly?: boolean
}

export function QuoteLineItems({
  control,
  watch,
  setValue,
  getValues,
  taxRate,
  parts,
  readOnly = false,
}: QuoteLineItemsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  })

  const lines = watch('lines') || []
  const hasInitializedRef = useRef(false)

  // Ensure at least one blank line in edit mode when first entering edit mode
  useEffect(() => {
    if (!readOnly && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      if (fields.length === 0) {
        // No lines at all, add one
        addLine()
      } else {
        // Has existing lines, check if last line is blank
        const lastLine = lines[lines.length - 1]
        const isLastLineBlank = !lastLine?.sku?.trim() && 
                                !lastLine?.description?.trim() &&
                                !lastLine?.part_id
        if (!isLastLineBlank) {
          // Last line has content, add a blank line
          addLine()
        }
      }
    }
    
    // Reset the flag when switching to read-only mode
    if (readOnly) {
      hasInitializedRef.current = false
    }
  }, [readOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const findPartBySku = (rawSku: string | null | undefined) => {
    if (!rawSku) return undefined
    const normalized = rawSku.trim().toLowerCase()
    if (!normalized) return undefined
    return parts.find((part) => (part.sku || '').toLowerCase() === normalized)
  }

  const findPartByDescription = (text: string | null | undefined) => {
    if (!text) return undefined
    const normalized = text.trim().toLowerCase()
    if (!normalized) return undefined
    return parts.find((part) => {
      const description = part.description_default || part.name || ''
      return description.toLowerCase() === normalized
    })
  }

  const applyPartToLine = (index: number, part: Part) => {
    setValue(`lines.${index}.part_id`, part.id, { shouldDirty: true })
    setValue(`lines.${index}.sku`, part.sku ?? '', { shouldDirty: true })
    setValue(
      `lines.${index}.description`,
      part.description_default || part.name || '',
      { shouldDirty: true }
    )
    setValue(`lines.${index}.uom`, part.uom || 'EA', { shouldDirty: true })
    setValue(`lines.${index}.unit_price`, part.sell_price ?? 0, {
      shouldDirty: true,
    })
    setValue(`lines.${index}.is_taxable`, part.is_taxable ?? true, {
      shouldDirty: true,
    })
    
    // Auto-add new blank line after selecting a part
    if (!readOnly && index === fields.length - 1) {
      setTimeout(() => addLine(), 0)
    }
  }

  const clearPartSelection = (index: number) => {
    setValue(`lines.${index}.part_id`, null, { shouldDirty: true })
  }

  const handleSkuCommit = (index: number) => {
    const currentSku = getValues(`lines.${index}.sku`) as string | undefined
    if (!currentSku) {
      clearPartSelection(index)
      return
    }

    const part = findPartBySku(currentSku)
    if (part) {
      applyPartToLine(index, part)
    } else {
      clearPartSelection(index)
    }
  }

  const handleDescriptionCommit = (index: number) => {
    const currentDescription = getValues(`lines.${index}.description`) as string | undefined
    if (!currentDescription) return

    const part = findPartByDescription(currentDescription)
    if (part) {
      applyPartToLine(index, part)
    } else {
      // Manual description entered (not a part), still add new line if on last row
      if (!readOnly && index === fields.length - 1 && currentDescription.trim()) {
        setTimeout(() => addLine(), 0)
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const currentSku = getValues(`lines.${index}.sku`) as string | undefined
      const currentDesc = getValues(`lines.${index}.description`) as string | undefined
      
      // If on last row and has content, add new line
      if (!readOnly && index === fields.length - 1) {
        if (currentSku?.trim() || currentDesc?.trim()) {
          addLine()
        }
      }
    }
  }

  const subtotal = lines.reduce((sum: number, line: QuoteLineItemFormData) => {
    const qty = Number(line.qty) || 0
    const price = Number(line.unit_price) || 0
    return sum + qty * price
  }, 0)

  const taxableSubtotal = lines.reduce((sum: number, line: QuoteLineItemFormData) => {
    if (!line.is_taxable) return sum
    const qty = Number(line.qty) || 0
    const price = Number(line.unit_price) || 0
    return sum + qty * price
  }, 0)

  const taxAmount = taxableSubtotal * taxRate
  const grandTotal = subtotal + taxAmount

  const addLine = () => {
    append({
      part_id: null,
      sku: '',
      description: '',
      uom: 'EA',
      qty: 1,
      unit_price: 0,
      is_taxable: true,
      line_no: fields.length + 1,
    })
  }

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-24">SKU</TableHead>
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
                  <TableCell colSpan={8} className="text-center text-slate-500">
                    No line items
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line: QuoteLineItemFormData, index: number) => {
                  const part = line.part_id
                    ? parts.find((candidate) => candidate.id === line.part_id)
                    : undefined
                  const sku = line.sku || part?.sku || ''
                  const lineTotal = (Number(line.qty) || 0) * (Number(line.unit_price) || 0)
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{sku || '—'}</TableCell>
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
      <div className="bg-white rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-32">SKU</TableHead>
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
                <TableCell colSpan={9} className="text-center text-slate-500">
                  No line items. Click &quot;Add Line&quot; to start building your quote.
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field, index) => {
                const line = lines[index] || field
                const lineTotal = ((Number(line.qty) || 0) * (Number(line.unit_price) || 0))
                
                return (
                  <TableRow key={field.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="min-w-[160px]">
                      <Controller
                        control={control}
                        name={`lines.${index}.sku`}
                        render={({ field: skuField }) => (
                          <PartsLookupInput
                            parts={parts}
                            value={skuField.value || ''}
                            onChange={(value) => {
                              skuField.onChange(value)
                              if (!value) {
                                clearPartSelection(index)
                              }
                            }}
                            onSelectPart={(part) => applyPartToLine(index, part)}
                            onBlur={() => handleSkuCommit(index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            placeholder="Search SKU..."
                            variant="sku"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell className="min-w-[220px]">
                      <Controller
                        control={control}
                        name={`lines.${index}.description`}
                        render={({ field: descriptionField }) => (
                          <PartsLookupInput
                            parts={parts}
                            value={descriptionField.value || ''}
                            onChange={descriptionField.onChange}
                            onSelectPart={(part) => applyPartToLine(index, part)}
                            onBlur={() => handleDescriptionCommit(index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            placeholder="Search or type description"
                            variant="description"
                          />
                        )}
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
      </div>

      {/* Add Line Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={addLine}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Line
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

    </div>
  )
}
