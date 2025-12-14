'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createQuote, updateQuote, createQuoteLine, updateQuoteLine, deleteQuoteLine } from '@/lib/data'
import { quoteHeaderSchema, quoteLineSchema } from '@/lib/validations'
import { getNextNumber, acceptQuote } from '@/lib/data'

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
    // Generate quote number
    const quoteNo = await getNextNumber('quote')
    
    // Create quote header
    const quote = await createQuote({
      ...parsed.data,
      quote_no: quoteNo,
      status: 'Draft',
    })

    // Create quote lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
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
    // Update quote header
    await updateQuote(id, parsed.data)

    // Track which existing lines are still present
    const updatedLineIds = new Set(lines.filter(l => l.id).map(l => l.id!))
    
    // Delete lines that were removed
    for (const lineId of existingLineIds) {
      if (!updatedLineIds.has(lineId)) {
        await deleteQuoteLine(lineId)
      }
    }

    // Update or create lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
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

export async function updateQuoteStatusAction(id: string, status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected') {
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
