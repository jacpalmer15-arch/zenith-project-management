'use server'
import { validateWorkOrderConsistency } from '@/lib/validations/data-consistency'
import { listWorkOrders } from '@/lib/data'

export async function runConsistencyCheck() {
  const workOrders = await listWorkOrders({})
  
  const results = await Promise.all(
    workOrders.map(async (wo) => {
      const validation = await validateWorkOrderConsistency(wo.id)
      return {
        workOrderId: wo.id,
        workOrderNo: wo.work_order_no,
        ...validation
      }
    })
  )
  
  const issueCount = results.filter(r => !r.valid).length
  
  return {
    totalChecked: results.length,
    withIssues: issueCount,
    results: results.filter(r => !r.valid)
  }
}
