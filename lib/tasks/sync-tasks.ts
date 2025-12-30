import { registerTask } from './index'

// Placeholder for future QuickBooks sync
registerTask('sync:customer', async (payload: { customerId: string }) => {
  console.log('[Task] Syncing customer to QuickBooks:', payload.customerId)
  // Future: Call QB API here
})

registerTask('sync:invoice', async (payload: { invoiceId: string }) => {
  console.log('[Task] Syncing invoice to QuickBooks:', payload.invoiceId)
  // Future: Call QB API here
})

registerTask('sync:payment', async (payload: { paymentId: string }) => {
  console.log('[Task] Syncing payment to QuickBooks:', payload.paymentId)
  // Future: Call QB API here
})

// Email tasks
registerTask('email:quote', async (payload: { quoteId: string; to: string }) => {
  console.log('[Task] Sending quote email:', payload)
  // Future: Call email service here
})

registerTask('email:invoice', async (payload: { invoiceId: string; to: string }) => {
  console.log('[Task] Sending invoice email:', payload)
  // Future: Call email service here
})
