'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createQuote, updateQuote, createQuoteLine, updateQuoteLine, deleteQuoteLine, getQuote } from '@/lib/data'
import { quoteHeaderSchema, quoteLineSchema } from '@/lib/validations'
import { getNextNumber, acceptQuote } from '@/lib/data'
import { validateQuoteParent } from '@/lib/validations/data-consistency'

interface QuoteLineData {
  id?: string
  part_id?: string | null
  description: string
  uom: string
  qty: number
  unit_price: number
  is_taxable: boolean
  line_no: number
}

export async function createQuoteAction(headerData: any, lines: QuoteLineData[]) {
  const parsed = quoteHeaderSchema.safeParse(headerData)
  
  if (!parsed.success) {
    return { error: 'Invalid quote data', details: parsed.error.errors }
  }

  try {
    // Validate parent relationship
    await validateQuoteParent({
      project_id: parsed.data.project_id,
      work_order_id: parsed.data.work_order_id
    })
    
    // Filter out empty lines (blank lines with no content)
    const validLines = lines.filter(line => {
      // Description must exist and not be empty after trimming
      if (!line.description || typeof line.description !== 'string' || line.description.trim().length === 0) {
        return false
      }
      // Quantity must be a positive number
      const qty = Number(line.qty)
      if (isNaN(qty) || qty <= 0) {
        return false
      }
      // Price must be a positive number
      const price = Number(line.unit_price)
      if (isNaN(price) || price <= 0) {
        return false
      }
      return true
    })

    if (validLines.length === 0) {
      return { error: 'At least one line item is required' }
    }

    // Generate quote number
    const quoteNo = await getNextNumber('quote')
    
    // Create quote header
    const quote = await createQuote({
      ...parsed.data,
      quote_no: quoteNo,
      status: 'DRAFT',
    })

    // Create quote lines
    for (let i = 0; i < validLines.length; i++) {
      const line = validLines[i]
      await createQuoteLine({
        quote_id: quote.id,
        line_no: i + 1,
        part_id: line.part_id || null,
        description: line.description,
        uom: line.uom,
        qty: line.qty,
        unit_price: line.unit_price,
        is_taxable: line.is_taxable,
      })
    }

    revalidatePath('/app/quotes')
    return { success: true, quoteId: quote.id }
  } catch (error) {
    console.error('Error creating quote:', error)
    return { error: 'Failed to create quote' }
  }
}

export async function updateQuoteAction(id: string, headerData: any, lines: QuoteLineData[], existingLineIds: string[]) {
  const parsed = quoteHeaderSchema.safeParse(headerData)
  
  if (!parsed.success) {
    return { error: 'Invalid quote data', details: parsed.error.errors }
  }

  try {
    // If changing parent, validate
    if ('project_id' in parsed.data || 'work_order_id' in parsed.data) {
      const existing = await getQuote(id)
      await validateQuoteParent({
        project_id: parsed.data.project_id ?? existing.project_id,
        work_order_id: parsed.data.work_order_id ?? existing.work_order_id
      })
    }
    
    // Filter out empty lines (blank lines with no content)
    const validLines = lines.filter(line => {
      // Description must exist and not be empty after trimming
      if (!line.description || typeof line.description !== 'string' || line.description.trim().length === 0) {
        return false
      }
      // Quantity must be a positive number
      const qty = Number(line.qty)
      if (isNaN(qty) || qty <= 0) {
        return false
      }
      // Price must be a positive number
      const price = Number(line.unit_price)
      if (isNaN(price) || price <= 0) {
        return false
      }
      return true
    })

    if (validLines.length === 0) {
      return { error: 'At least one line item is required' }
    }

    // Update quote header
    await updateQuote(id, parsed.data)

    // Track which existing lines are still present
    const updatedLineIds = new Set(validLines.filter(l => l.id).map(l => l.id!))
    
    // Delete lines that were removed
    for (const lineId of existingLineIds) {
      if (!updatedLineIds.has(lineId)) {
        await deleteQuoteLine(lineId)
      }
    }

    // Update or create lines
    for (let i = 0; i < validLines.length; i++) {
      const line = validLines[i]
      if (line.id) {
        // Update existing line
        await updateQuoteLine(line.id, {
          line_no: i + 1,
          part_id: line.part_id || null,
          description: line.description,
          uom: line.uom,
          qty: line.qty,
          unit_price: line.unit_price,
          is_taxable: line.is_taxable,
        })
      } else {
        // Create new line
        await createQuoteLine({
          quote_id: id,
          line_no: i + 1,
          part_id: line.part_id || null,
          description: line.description,
          uom: line.uom,
          qty: line.qty,
          unit_price: line.unit_price,
          is_taxable: line.is_taxable,
        })
      }
    }

    revalidatePath('/app/quotes')
    revalidatePath(`/app/quotes/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating quote:', error)
    return { error: 'Failed to update quote' }
  }
}

export async function acceptQuoteAction(id: string) {
  try {
    await acceptQuote(id)
    revalidatePath('/app/quotes')
    revalidatePath(`/app/quotes/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error accepting quote:', error)
    return { error: 'Failed to accept quote' }
  }
}

export async function deleteQuoteLineAction(lineId: string, quoteId: string) {
  try {
    await deleteQuoteLine(lineId)
    revalidatePath(`/app/quotes/${quoteId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting line:', error)
    return { error: 'Failed to delete line' }
  }
}

export async function updateQuoteStatusAction(id: string, status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED') {
  try {
    await updateQuote(id, { status })
    revalidatePath('/app/quotes')
    revalidatePath(`/app/quotes/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating quote status:', error)
    return { error: 'Failed to update quote status' }
  }
}
