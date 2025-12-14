'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsSchema, SettingsFormData } from '@/lib/validations/settings'
import { updateSettingsAction } from '@/app/actions/settings'
import { Settings, TaxRule } from '@/lib/db'
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
import { toast } from 'sonner'

interface SettingsFormProps {
  settings: Settings
  taxRules: TaxRule[]
}

export function SettingsForm({ settings, taxRules }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: settings.company_name,
      company_phone: settings.company_phone || '',
      company_email: settings.company_email || '',
      company_address: settings.company_address || '',
      default_quote_terms: settings.default_quote_terms,
      default_tax_rule_id: settings.default_tax_rule_id || '',
      customer_number_prefix: settings.customer_number_prefix,
      project_number_prefix: settings.project_number_prefix,
      quote_number_prefix: settings.quote_number_prefix,
    },
  })

  const defaultTaxRuleId = watch('default_tax_rule_id')

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('id', settings.id)
      formData.append('company_name', data.company_name)
      formData.append('company_phone', data.company_phone || '')
      formData.append('company_email', data.company_email || '')
      formData.append('company_address', data.company_address || '')
      formData.append('default_quote_terms', data.default_quote_terms)
      formData.append('default_tax_rule_id', data.default_tax_rule_id || '')
      formData.append('customer_number_prefix', data.customer_number_prefix)
      formData.append('project_number_prefix', data.project_number_prefix)
      formData.append('quote_number_prefix', data.quote_number_prefix)

      const result = await updateSettingsAction(formData)

      if (result.success) {
        toast.success('Settings updated successfully')
      } else {
        toast.error(result.error || 'Failed to update settings')
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
      {/* Company Information */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              {...register('company_name')}
              placeholder="Your Company Name"
            />
            {errors.company_name && (
              <p className="text-sm text-red-600 mt-1">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company_phone">Company Phone</Label>
            <Input
              id="company_phone"
              {...register('company_phone')}
              placeholder="(555) 123-4567"
            />
            {errors.company_phone && (
              <p className="text-sm text-red-600 mt-1">{errors.company_phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company_email">Company Email</Label>
            <Input
              id="company_email"
              type="email"
              {...register('company_email')}
              placeholder="company@example.com"
            />
            {errors.company_email && (
              <p className="text-sm text-red-600 mt-1">{errors.company_email.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="company_address">Company Address</Label>
          <Textarea
            id="company_address"
            {...register('company_address')}
            placeholder="123 Main St, City, State ZIP"
            rows={3}
          />
          {errors.company_address && (
            <p className="text-sm text-red-600 mt-1">{errors.company_address.message}</p>
          )}
        </div>
      </div>

      {/* Number Prefixes */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Number Prefixes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="customer_number_prefix">Customer Prefix *</Label>
            <Input
              id="customer_number_prefix"
              {...register('customer_number_prefix')}
              placeholder="CUST"
            />
            {errors.customer_number_prefix && (
              <p className="text-sm text-red-600 mt-1">
                {errors.customer_number_prefix.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="project_number_prefix">Project Prefix *</Label>
            <Input
              id="project_number_prefix"
              {...register('project_number_prefix')}
              placeholder="PROJ"
            />
            {errors.project_number_prefix && (
              <p className="text-sm text-red-600 mt-1">
                {errors.project_number_prefix.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="quote_number_prefix">Quote Prefix *</Label>
            <Input
              id="quote_number_prefix"
              {...register('quote_number_prefix')}
              placeholder="QTE"
            />
            {errors.quote_number_prefix && (
              <p className="text-sm text-red-600 mt-1">
                {errors.quote_number_prefix.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quote Configuration */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quote Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="default_tax_rule_id">Default Tax Rule</Label>
            <Select
              value={defaultTaxRuleId || 'none'}
              onValueChange={(value) =>
                setValue('default_tax_rule_id', value === 'none' ? '' : value)
              }
            >
              <SelectTrigger id="default_tax_rule_id">
                <SelectValue placeholder="Select a default tax rule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {taxRules
                  .filter((rule) => rule.is_active)
                  .map((rule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      {rule.name} ({(rule.rate * 100).toFixed(2)}%)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.default_tax_rule_id && (
              <p className="text-sm text-red-600 mt-1">
                {errors.default_tax_rule_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="default_quote_terms">Default Quote Terms</Label>
            <Textarea
              id="default_quote_terms"
              {...register('default_quote_terms')}
              placeholder="Enter default terms and conditions for quotes..."
              rows={6}
            />
            {errors.default_quote_terms && (
              <p className="text-sm text-red-600 mt-1">
                {errors.default_quote_terms.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-slate-200">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
