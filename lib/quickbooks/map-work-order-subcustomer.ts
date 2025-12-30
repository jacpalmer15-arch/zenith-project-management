import { getAuthenticatedQbClient } from './auth'
import { getWorkOrder, updateWorkOrder } from '@/lib/data/work-orders'
import { createQbMapping, getQbMapping } from '@/lib/data/qb-mappings'
import { createSyncLog } from '@/lib/data/qb-sync-logs'

/**
 * Create a QuickBooks subcustomer (Job) for a work order
 */
export async function createSubcustomerForWorkOrder(workOrderId: string) {
  try {
    const workOrder = await getWorkOrder(workOrderId)
    
    // Check if work order already has a subcustomer
    if (workOrder.qb_subcustomer_id) {
      throw new Error('Work order already has a QuickBooks subcustomer')
    }
    
    // Get customer mapping
    const customerMapping = await getQbMapping('customer', workOrder.customer_id)
    
    if (!customerMapping) {
      throw new Error('Customer not synced to QuickBooks. Please sync customers first.')
    }
    
    const qbClient = await getAuthenticatedQbClient()
    
    // Create subcustomer (Job) in QuickBooks
    const subcustomerName = `${workOrder.work_order_no} - ${workOrder.summary || 'Work Order'}`
    const subcustomer = await qbClient.create('Customer', {
      DisplayName: subcustomerName,
      ParentRef: {
        value: customerMapping.qb_list_id,
      },
      Job: true,
    })
    
    // Update work order with subcustomer reference
    await updateWorkOrder(workOrderId, {
      qb_subcustomer_id: subcustomer.Customer.Id,
      qb_subcustomer_name: subcustomer.Customer.DisplayName,
    })
    
    // Create mapping
    await createQbMapping({
      zenith_entity_type: 'work_order',
      zenith_entity_id: workOrderId,
      qb_entity_type: 'Job',
      qb_list_id: subcustomer.Customer.Id,
      qb_full_name: subcustomer.Customer.FullyQualifiedName,
      qb_edit_sequence: subcustomer.Customer.SyncToken,
    })
    
    // Log success
    await createSyncLog({
      sync_type: 'customer_sync',
      direction: 'to_qb',
      status: 'success',
      entity_type: 'work_order',
      entity_id: workOrderId,
      processed_count: 1,
    })
    
    return {
      success: true,
      subcustomerId: subcustomer.Customer.Id,
      subcustomerName: subcustomer.Customer.DisplayName,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    // Log error
    await createSyncLog({
      sync_type: 'customer_sync',
      direction: 'to_qb',
      status: 'error',
      entity_type: 'work_order',
      entity_id: workOrderId,
      error_message: message,
      processed_count: 0,
    })
    
    throw error
  }
}
