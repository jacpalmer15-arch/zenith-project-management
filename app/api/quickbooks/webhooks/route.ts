import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createWebhookEvent } from '@/lib/data/qb-webhook-events'
import { processWebhookEvents } from '@/lib/quickbooks/process-webhooks'

/**
 * Verify webhook signature from QuickBooks
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    return false
  }

  const webhookToken = process.env.QUICKBOOKS_WEBHOOK_VERIFICATION_TOKEN
  if (!webhookToken) {
    console.error('QUICKBOOKS_WEBHOOK_VERIFICATION_TOKEN not configured')
    return false
  }

  const hash = crypto
    .createHmac('sha256', webhookToken)
    .update(payload)
    .digest('base64')

  return hash === signature
}

/**
 * Handle incoming webhooks from QuickBooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw payload
    const payload = await request.text()

    // Verify webhook signature
    const signature = request.headers.get('intuit-signature')

    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook data
    const webhookData = JSON.parse(payload)

    // Store webhook events
    const eventPromises = []

    for (const notification of webhookData.eventNotifications || []) {
      const realmId = notification.realmId

      for (const entity of notification.dataChangeEvent?.entities || []) {
        eventPromises.push(
          createWebhookEvent({
            realm_id: realmId,
            event_name: entity.name,
            event_operation: entity.operation,
            entity_id: entity.id,
            event_time: new Date(notification.dataChangeEvent.eventTime || Date.now()),
            webhook_payload: notification,
          })
        )
      }
    }

    await Promise.all(eventPromises)

    console.log(`Stored ${eventPromises.length} webhook events`)

    // Process webhooks asynchronously (don't await to return quickly)
    processWebhookEvents().catch((error) => {
      console.error('Error processing webhooks:', error)
    })

    return NextResponse.json({ status: 'received' })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
