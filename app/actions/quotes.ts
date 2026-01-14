'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  createQuote, 
  updateQuote, 
  createQuoteLine, 
  updateQuoteLine, 
  deleteQuoteLine, 
  getQuote, 
  getQuoteLine,
  recalculateQuoteTotals,
  createWorkOrder,
  getLocationsByCustomer,
  createLocation,
  getProject,
  getCustomer
} from '@/lib/data'
import { quoteHeaderSchema } from '@/lib/validations'
import { getNextNumber, acceptQuote } from '@/lib/data'
import { validateQuoteParent } from '@/lib/validations/data-consistency'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { logAction } from '@/lib/audit/log'

async function resolveWorkOrderLocationId(
  projectId: string,
  customerId: string,
  actorUserId?: string
): Promise<string> {
  const [project, customer, locations] = await Promise.all([
    getProject(projectId),
    getCustomer(customerId),
    getLocationsByCustomer(customerId),
  ])

  const projectAddress = {
    street: project.job_street || null,
    city: project.job_city || null,
    state: project.job_state || null,
    zip: project.job_zip || null,
  }

  const findMatch = (address: typeof projectAddress) =>
    locations.find(
      (location) =>
        location.street === address.street &&
        location.city === address.city &&
        location.state === address.state &&
        location.zip === address.zip
    )

  if (projectAddress.street && projectAddress.city && projectAddress.state && projectAddress.zip) {
    const match = findMatch(projectAddress)
    if (match) return match.id

    const created = await createLocation({
      customer_id: customerId,
      label: project.name || null,
      street: projectAddress.street,
      city: projectAddress.city,
      state: projectAddress.state,
      zip: projectAddress.zip,
      notes: null,
      is_active: true,
    })
    if (actorUserId) {
      await logAction('locations', created.id, 'CREATE', actorUserId, null, created)
    }
    return created.id
  }

  if (locations.length === 1) {
    return locations[0].id
  }

  const customerService = {
    street: customer.service_street || customer.billing_street || null,
    city: customer.service_city || customer.billing_city || null,
    state: customer.service_state || customer.billing_state || null,
    zip: customer.service_zip || customer.billing_zip || null,
  }

  if (customerService.street && customerService.city && customerService.state && customerService.zip) {
    const match = findMatch(customerService)
    if (match) return match.id

    const created = await createLocation({
      customer_id: customerId,
      label: customer.name,
      street: customerService.street,
      city: customerService.city,
      state: customerService.state,
      zip: customerService.zip,
      notes: null,
      is_active: true,
    })
    if (actorUserId) {
      await logAction('locations', created.id, 'CREATE', actorUserId, null, created)
    }
    return created.id
  }

  if (locations.length > 1) {
    return locations[0].id
  }

  throw new Error(
    'Cannot create work order without a valid service address. Please add a location or service address.'
  )
}

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
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'edit_quotes')) {
    return { error: 'Permission denied' }
  }

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
    } as any)
    if (user) {
      await logAction('quotes', quote.id, 'CREATE', user.id, null, quote)
    }

    // Create quote lines
    for (let i = 0; i < validLines.length; i++) {
      const line = validLines[i]
      const createdLine = await createQuoteLine({
        quote_id: quote.id,
        line_no: i + 1,
        part_id: line.part_id || null,
        description: line.description,
        uom: line.uom,
        qty: line.qty,
        unit_price: line.unit_price,
        is_taxable: line.is_taxable,
      })
      if (user) {
        await logAction('quote_lines', createdLine.id, 'CREATE', user.id, null, createdLine)
      }
    }

    // Recalculate quote totals from all lines
    await recalculateQuoteTotals(quote.id)

    revalidatePath('/app/quotes')
    return { success: true, quoteId: quote.id }
  } catch (error) {
    console.error('Error creating quote:', error)
    return { error: 'Failed to create quote' }
  }
}

export async function updateQuoteAction(id: string, headerData: any, lines: QuoteLineData[], existingLineIds: string[]) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'edit_quotes')) {
    return { error: 'Permission denied' }
  }

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
    const before = await getQuote(id)
    const updated = await updateQuote(id, parsed.data as any)
    if (user) {
      await logAction('quotes', id, 'UPDATE', user.id, before, updated)
    }

    // Track which existing lines are still present
    const updatedLineIds = new Set(validLines.filter(l => l.id).map(l => l.id!))
    
    // Delete lines that were removed
    for (const lineId of existingLineIds) {
      if (!updatedLineIds.has(lineId)) {
        const before = await getQuoteLine(lineId)
        await deleteQuoteLine(lineId)
        if (user) {
          await logAction('quote_lines', lineId, 'DELETE', user.id, before, null)
        }
      }
    }

    // Update or create lines
    for (let i = 0; i < validLines.length; i++) {
      const line = validLines[i]
      if (line.id) {
        // Update existing line
        const before = await getQuoteLine(line.id)
        const updatedLine = await updateQuoteLine(line.id, {
          line_no: i + 1,
          part_id: line.part_id || null,
          description: line.description,
          uom: line.uom,
          qty: line.qty,
          unit_price: line.unit_price,
          is_taxable: line.is_taxable,
        })
        if (user) {
          await logAction('quote_lines', line.id, 'UPDATE', user.id, before, updatedLine)
        }
      } else {
        // Create new line
        const createdLine = await createQuoteLine({
          quote_id: id,
          line_no: i + 1,
          part_id: line.part_id || null,
          description: line.description,
          uom: line.uom,
          qty: line.qty,
          unit_price: line.unit_price,
          is_taxable: line.is_taxable,
        })
        if (user) {
          await logAction('quote_lines', createdLine.id, 'CREATE', user.id, null, createdLine)
        }
      }
    }

    // Recalculate quote totals from all lines
    await recalculateQuoteTotals(id)

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
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_quotes')) {
      return { error: 'Permission denied' }
    }

    // TODO(db): move accept+create work order flow into a transactional RPC for atomicity.
    const existing = await getQuote(id)
    if (existing.status !== 'ACCEPTED') {
      await acceptQuote(id)
      if (user) {
        await logAction('quotes', id, 'STATUS_CHANGE', user.id, { status: existing.status }, { status: 'ACCEPTED' })
      }
    }

    const refreshed = await getQuote(id)

    if (!refreshed.work_order_id) {
      const project = await getProject(refreshed.project_id)
      const locationId = await resolveWorkOrderLocationId(
        refreshed.project_id,
        project.customer_id,
        user?.id
      )
      const workOrderNo = await getNextNumber('work_order')

      const workOrder = await createWorkOrder({
        customer_id: project.customer_id,
        location_id: locationId,
        work_order_no: workOrderNo,
        status: 'UNSCHEDULED',
        priority: 3,
        summary: project.name || `Quote ${refreshed.quote_no}`,
        description: '',
        requested_window_start: null,
        requested_window_end: null,
        assigned_to: null,
        contract_subtotal: refreshed.subtotal || 0,
        contract_tax: refreshed.tax_total || 0,
        contract_total: refreshed.total_amount || 0,
      })

      if (user) {
        await logAction('work_orders', workOrder.id, 'CREATE', user.id, null, workOrder)
        // TODO(schema): allow quotes to store work_order_id while still linked to projects.
        await logAction(
          'quotes',
          id,
          'UPDATE',
          user.id,
          refreshed,
          refreshed,
          `Work order ${workOrder.work_order_no} created from accepted quote`
        )
      }
    }

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
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_quotes')) {
      return { error: 'Permission denied' }
    }

    const before = await getQuoteLine(lineId)
    await deleteQuoteLine(lineId)
    if (user) {
      await logAction('quote_lines', lineId, 'DELETE', user.id, before, null)
    }
    // Recalculate quote totals after deleting a line
    await recalculateQuoteTotals(quoteId)
    revalidatePath(`/app/quotes/${quoteId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting line:', error)
    return { error: 'Failed to delete line' }
  }
}

export async function updateQuoteStatusAction(id: string, status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED') {
  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_quotes')) {
      return { error: 'Permission denied' }
    }

    if (status === 'ACCEPTED') {
      return await acceptQuoteAction(id)
    }

    const before = await getQuote(id)
    await updateQuote(id, { status })
    if (user) {
      await logAction('quotes', id, 'STATUS_CHANGE', user.id, { status: before.status }, { status })
    }
    revalidatePath('/app/quotes')
    revalidatePath(`/app/quotes/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating quote status:', error)
    return { error: 'Failed to update quote status' }
  }
}
