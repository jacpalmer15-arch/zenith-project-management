import { getAuthenticatedQbClient } from './auth'
import { listCustomers, createCustomer, updateCustomer } from '@/lib/data/customers'
import { createQbMapping, getQbMapping, getQbMappingByQbId, updateQbMapping } from '@/lib/data/qb-mappings'
import { createSyncLog } from '@/lib/data/qb-sync-logs'
import { getNextNumber } from '@/lib/data/rpcs'

/**
 * Sync customers from Zenith to QuickBooks
 */
export async function syncCustomersToQuickBooks() {
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []
  
  try {
    const qbClient = await getAuthenticatedQbClient()
    const zenithCustomers = await listCustomers()
    
    for (const customer of zenithCustomers) {
      try {
        const existingMapping = await getQbMapping('customer', customer.id)
        
        if (existingMapping) {
          // Update existing QB customer
          await qbClient.update('Customer', {
            Id: existingMapping.qb_list_id,
            DisplayName: customer.name,
            PrimaryEmailAddr: customer.email ? { Address: customer.email } : undefined,
            PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
            BillAddr: {
              Line1: customer.billing_street || '',
              City: customer.billing_city || '',
              CountrySubDivisionCode: customer.billing_state || '',
              PostalCode: customer.billing_zip || '',
            },
            SyncToken: existingMapping.qb_edit_sequence || '0',
          })
          
          // Update mapping timestamp
          await updateQbMapping(existingMapping.id, {
            last_synced_at: new Date().toISOString(),
          })
        } else {
          // Create new QB customer
          const qbCustomer = await qbClient.create('Customer', {
            DisplayName: customer.name,
            PrimaryEmailAddr: customer.email ? { Address: customer.email } : undefined,
            PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
            BillAddr: {
              Line1: customer.billing_street || '',
              City: customer.billing_city || '',
              CountrySubDivisionCode: customer.billing_state || '',
              PostalCode: customer.billing_zip || '',
            },
          })
          
          // Create mapping
          await createQbMapping({
            zenith_entity_type: 'customer',
            zenith_entity_id: customer.id,
            qb_entity_type: 'Customer',
            qb_list_id: qbCustomer.Customer.Id,
            qb_full_name: qbCustomer.Customer.DisplayName,
            qb_edit_sequence: qbCustomer.Customer.SyncToken,
          })
        }
        
        successCount++
      } catch (error) {
        errorCount++
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Customer ${customer.name}: ${message}`)
      }
    }
    
    // Log the sync operation
    await createSyncLog({
      sync_type: 'customer_sync',
      direction: 'to_qb',
      status: errorCount > 0 ? 'error' : 'success',
      processed_count: successCount,
      error_message: errors.length > 0 ? errors.join('\n') : null,
    })
    
    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      errors,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    await createSyncLog({
      sync_type: 'customer_sync',
      direction: 'to_qb',
      status: 'error',
      processed_count: successCount,
      error_message: message,
    })
    
    throw error
  }
}

/**
 * Sync customers from QuickBooks to Zenith
 */
export async function syncCustomersFromQuickBooks() {
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []
  
  try {
    const qbClient = await getAuthenticatedQbClient()
    const qbResponse = await qbClient.query<any>('SELECT * FROM Customer WHERE Active = true')
    const qbCustomers = qbResponse.QueryResponse?.Customer || []
    
    for (const qbCustomer of qbCustomers) {
      try {
        // Skip sub-customers (Jobs) - we'll handle those separately
        if (qbCustomer.Job === true) {
          continue
        }
        
        const existingMapping = await getQbMappingByQbId('Customer', qbCustomer.Id)
        
        if (existingMapping) {
          // Update Zenith customer
          await updateCustomer(existingMapping.zenith_entity_id, {
            name: qbCustomer.DisplayName,
            email: qbCustomer.PrimaryEmailAddr?.Address,
            phone: qbCustomer.PrimaryPhone?.FreeFormNumber,
            billing_street: qbCustomer.BillAddr?.Line1,
            billing_city: qbCustomer.BillAddr?.City,
            billing_state: qbCustomer.BillAddr?.CountrySubDivisionCode,
            billing_zip: qbCustomer.BillAddr?.PostalCode,
          })
          
          // Update mapping
          await updateQbMapping(existingMapping.id, {
            qb_full_name: qbCustomer.FullyQualifiedName,
            qb_edit_sequence: qbCustomer.SyncToken,
            last_synced_at: new Date().toISOString(),
          })
        } else {
          // Create new Zenith customer
          const customerNo = await getNextNumber('customer')
          const zenithCustomer = await createCustomer({
            customer_no: customerNo,
            name: qbCustomer.DisplayName,
            email: qbCustomer.PrimaryEmailAddr?.Address,
            phone: qbCustomer.PrimaryPhone?.FreeFormNumber,
            billing_street: qbCustomer.BillAddr?.Line1,
            billing_city: qbCustomer.BillAddr?.City,
            billing_state: qbCustomer.BillAddr?.CountrySubDivisionCode,
            billing_zip: qbCustomer.BillAddr?.PostalCode,
          })
          
          // Create mapping
          await createQbMapping({
            zenith_entity_type: 'customer',
            zenith_entity_id: zenithCustomer.id,
            qb_entity_type: 'Customer',
            qb_list_id: qbCustomer.Id,
            qb_full_name: qbCustomer.FullyQualifiedName,
            qb_edit_sequence: qbCustomer.SyncToken,
          })
        }
        
        successCount++
      } catch (error) {
        errorCount++
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`QB Customer ${qbCustomer.DisplayName}: ${message}`)
      }
    }
    
    // Log the sync operation
    await createSyncLog({
      sync_type: 'customer_sync',
      direction: 'from_qb',
      status: errorCount > 0 ? 'error' : 'success',
      processed_count: successCount,
      error_message: errors.length > 0 ? errors.join('\n') : null,
    })
    
    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      errors,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    await createSyncLog({
      sync_type: 'customer_sync',
      direction: 'from_qb',
      status: 'error',
      processed_count: successCount,
      error_message: message,
    })
    
    throw error
  }
}
