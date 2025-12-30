'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { quoteHeaderSchema, QuoteHeaderFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Project, Quote, TaxRule, QuoteStatus } from '@/lib/db'

interface ProjectWithCustomer extends Project {
  customer?: {
    id: string
    customer_no: string
    name: string
  } | null
}

interface QuoteWithRelations extends Quote {
  project?: ProjectWithCustomer | null
  tax_rule?: TaxRule | null
}

interface QuoteHeaderFormProps {
  projects: ProjectWithCustomer[]
  taxRules: TaxRule[]
  quotes?: QuoteWithRelations[]
  defaultValues?: Partial<QuoteHeaderFormData> & { status?: QuoteStatus }
  onSubmit: (data: QuoteHeaderFormData & { status?: QuoteStatus }) => void
  onCancel: () => void
  isSubmitting?: boolean
  isEdit?: boolean
}

const QUOTE_STATUSES: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']

export function QuoteHeaderForm({
  projects,
  taxRules,
  quotes = [],
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: QuoteHeaderFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteHeaderFormData & { status?: QuoteStatus }>({
    resolver: zodResolver(quoteHeaderSchema),
    defaultValues: {
      project_id: defaultValues?.project_id || '',
      quote_type: defaultValues?.quote_type || 'BASE',
      parent_quote_id: defaultValues?.parent_quote_id || null,
      tax_rule_id: defaultValues?.tax_rule_id || '',
      quote_date: defaultValues?.quote_date || new Date().toISOString().split('T')[0],
      valid_until: defaultValues?.valid_until || null,
      status: defaultValues?.status || 'DRAFT',
    },
  })

  const quoteType = watch('quote_type')
  const selectedProjectId = watch('project_id')

  // Filter quotes for parent quote selector (same project only)
  const availableParentQuotes = quotes.filter(
    (q) => q.project_id === selectedProjectId && q.quote_type === 'BASE'
  )

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project Information */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Project Information
        </h3>
        <div className="space-y-4">
          {/* Project Selector */}
          <div className="space-y-2">
            <Label htmlFor="project_id">
              Project <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="project_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isEdit}
                >
                  <SelectTrigger id="project_id">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_no} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.project_id && (
              <p className="text-sm text-red-500">{errors.project_id.message}</p>
            )}
          </div>

          {/* Customer Display (read-only) */}
          {selectedProject?.customer && (
            <div className="space-y-2">
              <Label>Customer</Label>
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                {selectedProject.customer.customer_no} - {selectedProject.customer.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Details */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Quote Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quote Type */}
          <div className="space-y-2">
            <Label htmlFor="quote_type">
              Quote Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="quote_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEdit}
                >
                  <SelectTrigger id="quote_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASE">Base</SelectItem>
                    <SelectItem value="CHANGE_ORDER">Change Order</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.quote_type && (
              <p className="text-sm text-red-500">{errors.quote_type.message}</p>
            )}
          </div>

          {/* Parent Quote (conditional) */}
          {quoteType === 'CHANGE_ORDER' && (
            <div className="space-y-2">
              <Label htmlFor="parent_quote_id">
                Parent Quote <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="parent_quote_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : value)
                    }
                  >
                    <SelectTrigger id="parent_quote_id">
                      <SelectValue placeholder="Select parent quote" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>
                        Select parent quote
                      </SelectItem>
                      {availableParentQuotes.map((quote) => (
                        <SelectItem key={quote.id} value={quote.id}>
                          {quote.quote_no}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.parent_quote_id && (
                <p className="text-sm text-red-500">
                  {errors.parent_quote_id.message}
                </p>
              )}
            </div>
          )}

          {/* Tax Rule */}
          <div className="space-y-2">
            <Label htmlFor="tax_rule_id">
              Tax Rule <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="tax_rule_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tax_rule_id">
                    <SelectValue placeholder="Select tax rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxRules
                      .filter((tr) => tr.is_active)
                      .map((taxRule) => (
                        <SelectItem key={taxRule.id} value={taxRule.id}>
                          {taxRule.name} ({(taxRule.rate * 100).toFixed(2)}%)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tax_rule_id && (
              <p className="text-sm text-red-500">{errors.tax_rule_id.message}</p>
            )}
          </div>

          {/* Quote Date */}
          <div className="space-y-2">
            <Label htmlFor="quote_date">
              Quote Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quote_date"
              type="date"
              {...register('quote_date')}
            />
            {errors.quote_date && (
              <p className="text-sm text-red-500">{errors.quote_date.message}</p>
            )}
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label htmlFor="valid_until">Valid Until</Label>
            <Input
              id="valid_until"
              type="date"
              {...register('valid_until')}
            />
            {errors.valid_until && (
              <p className="text-sm text-red-500">{errors.valid_until.message}</p>
            )}
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUOTE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Quote' : 'Create Quote'}
        </Button>
      </div>
    </form>
  )
}
