'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuoteHeaderForm } from './quote-header-form'
import { QuoteLineItems, QuoteLineItemFormData } from './quote-line-items'
import { QuoteStatusBadge } from './quote-status-badge'
import { QuoteTypeBadge } from './quote-type-badge'
import { DownloadQuotePDF } from './download-quote-pdf'
import { SendQuoteEmailButton } from './send-quote-email-button'
import { acceptQuoteAction, updateQuoteAction } from '@/app/actions/quotes'
import { toast } from 'sonner'
import { ArrowLeft, Edit, CheckCircle } from 'lucide-react'
import type { Quote, Project, TaxRule, Part, QuoteLine } from '@/lib/db'

interface ProjectWithCustomer extends Project {
  customer?: {
    id: string
    customer_no: string
    name: string
    email: string | null
  } | null
}

interface QuoteWithRelations extends Quote {
  project?: ProjectWithCustomer | null
  tax_rule?: TaxRule | null
  parent_quote?: { id: string; quote_no: string } | null
}

interface QuoteDetailsProps {
  quote: QuoteWithRelations
  lines: QuoteLine[]
  projects: ProjectWithCustomer[]
  taxRules: TaxRule[]
  quotes: QuoteWithRelations[]
  parts: Part[]
}

export function QuoteDetails({
  quote,
  lines,
  projects,
  taxRules,
  quotes,
  parts,
}: QuoteDetailsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, watch, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      lines: lines.map((line, index) => {
        const matchedPart = parts.find((candidate) => candidate.id === line.part_id)
        return {
          id: line.id,
          part_id: line.part_id,
          sku: matchedPart?.sku || '',
          description: line.description,
          uom: line.uom,
          qty: line.qty,
          unit_price: line.unit_price,
          is_taxable: line.is_taxable,
          line_no: index + 1,
        }
      }),
    },
  })

  const canEdit = quote.status === 'DRAFT'
  const canAccept = quote.status === 'SENT'
  const taxRate = quote.tax_rule?.rate || 0

  const handleAcceptQuote = async () => {
    if (!confirm('Are you sure you want to accept this quote? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await acceptQuoteAction(quote.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Quote accepted successfully')
        router.push('/app/quotes')
      }
    } catch (error) {
      toast.error('Failed to accept quote')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveLines = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Filter out blank lines before saving
      const validLines = data.lines.filter((line: any) => {
        if (!line.description || typeof line.description !== 'string' || line.description.trim().length === 0) {
          return false
        }
        const qty = Number(line.qty)
        if (isNaN(qty) || qty <= 0) {
          return false
        }
        const price = Number(line.unit_price)
        if (isNaN(price) || price <= 0) {
          return false
        }
        return true
      })

      const existingLineIds = lines.map((line) => line.id)
      const result = await updateQuoteAction(
        quote.id,
        {
          project_id: quote.project_id,
          quote_type: quote.quote_type,
          parent_quote_id: quote.parent_quote_id,
          tax_rule_id: quote.tax_rule_id,
          quote_date: quote.quote_date,
          valid_until: quote.valid_until,
          status: quote.status,
        },
        validLines,
        existingLineIds
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        // Update the form state to remove blank lines immediately
        reset({
          lines: validLines
        })
        toast.success('Quote updated successfully')
        setIsEditing(false)
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to update quote')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Quote</h1>
            <p className="text-slate-600 mt-1">Quote #{quote.quote_no}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                reset()
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit(handleSaveLines)} disabled={isSubmitting} type="button">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Quote Header (Display Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Project</p>
                <p className="font-medium">
                  {quote.project?.project_no} - {quote.project?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Customer</p>
                <p className="font-medium">
                  {quote.project?.customer?.customer_no} - {quote.project?.customer?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Quote Type</p>
                <QuoteTypeBadge type={quote.quote_type} />
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <QuoteStatusBadge status={quote.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <QuoteLineItems
          control={control}
          watch={watch}
          setValue={setValue}
          getValues={getValues}
          taxRate={taxRate}
          parts={parts}
          readOnly={false}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/app/quotes')}
            className="mb-2 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Quote #{quote.quote_no}</h1>
        </div>
        <div className="flex gap-3">
          <DownloadQuotePDF quoteId={quote.id} quoteNo={quote.quote_no} />
          <SendQuoteEmailButton
            quoteId={quote.id}
            quoteNo={quote.quote_no}
            customerName={quote.project?.customer?.name || 'Unknown'}
            customerEmail={quote.project?.customer?.email}
            status={quote.status}
          />
          {canEdit && (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {canAccept && (
            <Button
              onClick={handleAcceptQuote}
              disabled={isSubmitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Accept Quote
            </Button>
          )}
        </div>
      </div>

      {/* Quote Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Project</p>
              <p className="font-medium">
                {quote.project?.project_no} - {quote.project?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Customer</p>
              <p className="font-medium">
                {quote.project?.customer?.customer_no} - {quote.project?.customer?.name}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-slate-600">Quote Type</p>
                <QuoteTypeBadge type={quote.quote_type} />
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <QuoteStatusBadge status={quote.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Quote Date</p>
              <p className="font-medium" suppressHydrationWarning>
                {new Date(quote.quote_date).toLocaleDateString()}
              </p>
            </div>
            {quote.valid_until && (
              <div>
                <p className="text-sm text-slate-600">Valid Until</p>
                <p className="font-medium" suppressHydrationWarning>
                  {new Date(quote.valid_until).toLocaleDateString()}
                </p>
              </div>
            )}
            {quote.parent_quote && (
              <div>
                <p className="text-sm text-slate-600">Parent Quote</p>
                <p className="font-medium">{quote.parent_quote.quote_no}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Tax Rule</p>
              <p className="font-medium">
                {quote.tax_rule?.name} ({(taxRate * 100).toFixed(2)}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <QuoteLineItems
        control={control}
        watch={watch}
        setValue={setValue}
        getValues={getValues}
        taxRate={taxRate}
        parts={parts}
        readOnly={true}
      />
    </div>
  )
}
