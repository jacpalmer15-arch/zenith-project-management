'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partSchema, PartFormData } from '@/lib/validations'
import { createPartAction, updatePartAction } from '@/app/actions/parts'
import { PartCategory, CostType, CostCode } from '@/lib/db'
import { PartWithRelations } from '@/lib/data/parts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface PartFormProps {
  part?: PartWithRelations
  categories: PartCategory[]
  costTypes: CostType[]
  costCodes: CostCode[]
}

export function PartForm({ part, categories, costTypes, costCodes }: PartFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      sku: part?.sku || '',
      name: part?.name || '',
      description_default: part?.description_default || '',
      category_id: part?.category_id || null,
      uom: part?.uom || '',
      is_taxable: part?.is_taxable ?? true,
      cost_type_id: part?.cost_type_id || null,
      cost_code_id: part?.cost_code_id || null,
      sell_price: part?.sell_price || 0,
      is_active: part?.is_active ?? true,
    },
  })

  const isTaxable = watch('is_taxable')
  const isActive = watch('is_active')
  const selectedCostTypeId = watch('cost_type_id')
  const currentCostCodeId = watch('cost_code_id')

  // Filter cost codes by selected cost type
  const filteredCostCodes = useMemo(() => {
    return selectedCostTypeId
      ? costCodes.filter((cc) => cc.cost_type_id === selectedCostTypeId)
      : []
  }, [selectedCostTypeId, costCodes])

  // Reset cost code when cost type changes
  useEffect(() => {
    if (selectedCostTypeId && filteredCostCodes.length > 0) {
      const isValidCostCode = filteredCostCodes.some(cc => cc.id === currentCostCodeId)
      if (!isValidCostCode) {
        setValue('cost_code_id', null)
      }
    } else if (currentCostCodeId) {
      setValue('cost_code_id', null)
    }
  }, [selectedCostTypeId, currentCostCodeId, filteredCostCodes, setValue])

  const onSubmit = async (data: PartFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      // Append all fields to FormData
      if (data.sku !== null && data.sku !== undefined) formData.append('sku', data.sku)
      formData.append('name', data.name)
      formData.append('description_default', data.description_default || '')
      if (data.category_id !== null && data.category_id !== undefined) formData.append('category_id', data.category_id)
      formData.append('uom', data.uom)
      formData.append('is_taxable', data.is_taxable.toString())
      if (data.cost_type_id !== null && data.cost_type_id !== undefined) formData.append('cost_type_id', data.cost_type_id)
      if (data.cost_code_id !== null && data.cost_code_id !== undefined) formData.append('cost_code_id', data.cost_code_id)
      formData.append('sell_price', data.sell_price.toString())
      formData.append('is_active', data.is_active.toString())

      const result = part
        ? await updatePartAction(part.id, formData)
        : await createPartAction(formData)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(part ? 'Part updated successfully' : 'Part created successfully')
        // Navigation handled by server action redirect
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...register('sku')}
              placeholder="Auto-generated if empty"
            />
            {errors.sku && (
              <p className="text-sm text-red-600 mt-1">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">
              Part Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter part name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description_default">Default Description</Label>
            <Textarea
              id="description_default"
              {...register('description_default')}
              placeholder="Enter default description"
              rows={3}
            />
            {errors.description_default && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description_default.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category_id">Category</Label>
            <Select
              value={watch('category_id') || 'none'}
              onValueChange={(value) =>
                setValue('category_id', value === 'none' ? null : value)
              }
            >
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-600 mt-1">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="uom">
              Unit of Measure <span className="text-red-600">*</span>
            </Label>
            <Input
              id="uom"
              {...register('uom')}
              placeholder="e.g., EA, FT, HR"
            />
            {errors.uom && (
              <p className="text-sm text-red-600 mt-1">{errors.uom.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="is_taxable"
              checked={isTaxable}
              onCheckedChange={(checked) => setValue('is_taxable', !!checked)}
            />
            <Label htmlFor="is_taxable" className="cursor-pointer">
              Taxable
            </Label>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sell_price">
              Sell Price <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <Input
                id="sell_price"
                type="number"
                step="0.01"
                min="0"
                {...register('sell_price', { valueAsNumber: true })}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
            {errors.sell_price && (
              <p className="text-sm text-red-600 mt-1">
                {errors.sell_price.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cost Tracking */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Cost Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cost_type_id">Cost Type</Label>
            <Select
              value={watch('cost_type_id') || 'none'}
              onValueChange={(value) =>
                setValue('cost_type_id', value === 'none' ? null : value)
              }
            >
              <SelectTrigger id="cost_type_id">
                <SelectValue placeholder="Select cost type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Cost Type</SelectItem>
                {costTypes.map((costType) => (
                  <SelectItem key={costType.id} value={costType.id}>
                    {costType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cost_type_id && (
              <p className="text-sm text-red-600 mt-1">
                {errors.cost_type_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cost_code_id">Cost Code</Label>
            <Select
              value={watch('cost_code_id') || 'none'}
              onValueChange={(value) =>
                setValue('cost_code_id', value === 'none' ? null : value)
              }
              disabled={!selectedCostTypeId || filteredCostCodes.length === 0}
            >
              <SelectTrigger id="cost_code_id">
                <SelectValue placeholder="Select cost code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Cost Code</SelectItem>
                {filteredCostCodes.map((costCode) => (
                  <SelectItem key={costCode.id} value={costCode.id}>
                    {costCode.code} - {costCode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cost_code_id && (
              <p className="text-sm text-red-600 mt-1">
                {errors.cost_code_id.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Status</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue('is_active', !!checked)}
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Active
          </Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            part ? 'Update Part' : 'Create Part'
          )}
        </Button>
      </div>
    </form>
  )
}
