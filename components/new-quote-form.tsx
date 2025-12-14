'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { QuoteHeaderForm } from './quote-header-form'
import { QuoteLineItems } from './quote-line-items'
import { createQuoteAction } from '@/app/actions/quotes'
import { toast } from 'sonner'
import type { Project, TaxRule, Part, Quote } from '@/lib/db'

interface ProjectWithCustomer extends Project {
  customer?: {
    id: string
    customer_no: string
    name: string
  } | null
}

interface QuoteWithRelations extends Quote {
  project?: ProjectWithCustomer | null
}

interface NewQuoteFormProps {
  projects: ProjectWithCustomer[]
  taxRules: TaxRule[]
  quotes: QuoteWithRelations[]
  parts: Part[]
}

export function NewQuoteForm({ projects, taxRules, quotes, parts }: NewQuoteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [headerData, setHeaderData] = useState<any>(null)
  const [showLineItems, setShowLineItems] = useState(false)

  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      lines: [],
    },
  })

  const handleHeaderSubmit = (data: any) => {
    setHeaderData(data)
    setShowLineItems(true)
  }

  const handleFinalSubmit = async (data: any) => {
    if (!headerData) return

    setIsSubmitting(true)
    try {
      const result = await createQuoteAction(headerData, data.lines)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Quote created successfully')
        router.push(`/app/quotes/${result.quoteId}`)
      }
    } catch (error) {
      toast.error('Failed to create quote')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showLineItems) {
    return (
      <QuoteHeaderForm
        projects={projects}
        taxRules={taxRules}
        quotes={quotes}
        onSubmit={handleHeaderSubmit}
        onCancel={() => router.push('/app/quotes')}
        isSubmitting={false}
        isEdit={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Quote Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Quote Type:</span>{' '}
                <span className="font-medium">
                  {headerData.quote_type === 'BASE' ? 'Base' : 'Change Order'}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Quote Date:</span>{' '}
                <span className="font-medium">
                  {new Date(headerData.quote_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLineItems(false)}
          >
            Edit Header
          </Button>
        </div>
      </div>

      {/* Line Items */}
      <form onSubmit={handleSubmit(handleFinalSubmit)}>
        <QuoteLineItems
          control={control}
          watch={watch}
          taxRate={taxRules.find((tr) => tr.id === headerData.tax_rule_id)?.rate || 0}
          parts={parts}
          readOnly={false}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/app/quotes')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Quote'}
          </Button>
        </div>
      </form>
    </div>
  )
}
