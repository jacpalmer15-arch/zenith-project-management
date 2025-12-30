# Phase 2B: QuickBooks Financial Sync & Webhooks - Implementation Summary

## Overview

This implementation completes Phase 2B of the QuickBooks Desktop integration, adding comprehensive financial synchronization, webhook handling, and actual cost tracking capabilities.

## Files Created

### Database Migration
- `migrations/003_add_phase2b_quickbooks_tables.sql` - Adds QB references to quotes/receipts, webhook events table, and actual costs table

### Data Access Layer
- `lib/data/qb-webhook-events.ts` - CRUD operations for webhook event tracking
- `lib/data/qb-actual-costs.ts` - Manage actual costs from QuickBooks
- `lib/data/quotes.ts` - Added `getAcceptedQuoteForWorkOrder()` helper
- `lib/data/qb-sync-logs.ts` - Added `createQbSyncLog` alias

### QuickBooks Services
- `lib/quickbooks/create-invoice.ts` - Create invoices from accepted quotes
- `lib/quickbooks/create-bill.ts` - Create bills from allocated receipts  
- `lib/quickbooks/process-webhooks.ts` - Process incoming webhook events
- `lib/quickbooks/sync-worker.ts` - Background sync worker for scheduled operations

### API Routes
- `app/api/quickbooks/webhooks/route.ts` - Webhook endpoint with signature verification
- `app/api/quickbooks/sync-invoices/route.ts` - Manual invoice sync trigger
- `app/api/quickbooks/sync-bills/route.ts` - Manual bill sync trigger
- `app/api/quickbooks/sync-all/route.ts` - Full sync worker trigger
- `app/api/cron/quickbooks-sync/route.ts` - Scheduled cron endpoint

### UI Components
- `components/quickbooks/invoice-status-badge.tsx` - Display invoice payment status
- `components/quickbooks/bill-status-badge.tsx` - Display bill payment status
- `components/quickbooks/sync-status.tsx` - Show sync status indicator

### Reports
- `lib/data/reports.ts` - Enhanced with actual costs from QuickBooks
- `app/app/reports/work-order-profitability/client.tsx` - Updated to show actual vs estimated costs

### Configuration
- `vercel.json` - Cron job configuration (runs every 6 hours)
- `.env.example` - Added webhook token and cron secret
- `README.md` - Comprehensive Phase 2B documentation

## Key Features

### 1. Invoice Automation
- Automatically creates QuickBooks invoice when quote is accepted
- Links invoice to customer (or subcustomer/job if work order exists)
- Stores invoice ID and status in quote record
- Tracks sync status and errors in sync logs

### 2. Bill Automation
- Automatically creates QuickBooks bill when receipt is allocated
- Creates vendor in QuickBooks if it doesn't exist
- Links bill to work order job for job costing
- Stores bill ID and status in receipt record

### 3. Webhook Processing
- Receives real-time events from QuickBooks (Invoice, Payment, Bill, Customer)
- Verifies webhook signature using HMAC-SHA256
- Queues events for asynchronous processing
- Updates payment status in Zenith when QuickBooks payments received
- Can auto-close work orders when fully paid

### 4. Background Sync Worker
- Runs every 6 hours via Vercel Cron
- Syncs customers bidirectionally
- Creates missing invoices for accepted quotes
- Creates missing bills for allocated receipts
- Snapshots actual costs for reporting
- Updates connection status and logs errors

### 5. Actual Cost Tracking
- Queries QuickBooks for invoices and bills by job
- Calculates actual labor costs from invoices
- Calculates actual material costs from bills
- Stores snapshots in `qb_actual_costs` table
- Displays in Work Order Profitability report

### 6. Enhanced Reporting
- Work Order Profitability report now shows:
  - Estimated costs (from cost entries)
  - Actual costs (from QuickBooks)
  - Variance between estimated and actual
  - Estimated vs actual margin
- Conditional display (actual columns only shown when data exists)

## Data Flow

### Invoice Creation Flow
```
Quote Status → "Accepted"
  ↓
Create Invoice in QuickBooks
  ↓
Store Invoice ID in Quote
  ↓
Create QB Mapping Record
  ↓
Log to Sync Logs
```

### Payment Update Flow
```
Payment in QuickBooks
  ↓
Webhook Event Received
  ↓
Verify Signature
  ↓
Store in webhook_events Table
  ↓
Process Event Async
  ↓
Fetch Updated Invoice
  ↓
Update Quote Payment Status
  ↓
Optionally Close Work Order
```

### Actual Cost Flow
```
Sync Worker Triggered
  ↓
Query Jobs from QuickBooks
  ↓
For Each Job:
  - Get Invoices → Labor Cost
  - Get Bills → Material Cost
  ↓
Upsert to qb_actual_costs
  ↓
Display in Reports
```

## Security Measures

1. **Webhook Signature Verification**: All webhooks verified with HMAC-SHA256
2. **Cron Authentication**: Cron endpoint requires bearer token
3. **Server-Side Only**: No QuickBooks API calls from client
4. **Token Encryption**: OAuth tokens encrypted at rest
5. **Auto Token Refresh**: Tokens refreshed before API calls

## Environment Variables

Required additions to `.env`:

```bash
# Webhook verification token (from Intuit Developer Portal)
QUICKBOOKS_WEBHOOK_VERIFICATION_TOKEN=your_webhook_token

# Cron secret (generate with: openssl rand -hex 32)
CRON_SECRET=your_cron_secret
```

## API Endpoints

### Manual Sync Triggers
- `POST /api/quickbooks/sync-invoices` - Sync accepted quotes to invoices
- `POST /api/quickbooks/sync-bills` - Sync allocated receipts to bills
- `POST /api/quickbooks/sync-all` - Run full sync worker

### Webhook Handler
- `POST /api/quickbooks/webhooks` - Receive QB webhook events

### Scheduled Sync
- `GET /api/cron/quickbooks-sync` - Run sync worker (requires cron secret)

## Database Tables

### New Tables

1. **qb_webhook_events**: Tracks incoming webhook events
   - Stores event type, operation, entity ID, payload
   - Tracks processing status and errors

2. **qb_actual_costs**: Caches actual costs from QuickBooks
   - Stores costs by work order, cost type, and snapshot date
   - Unique constraint on (work_order_id, cost_type, snapshot_date)

### Enhanced Tables

1. **quotes**: Added QB invoice tracking columns
   - qb_invoice_id, qb_invoice_number, qb_invoice_status, qb_invoice_synced_at

2. **receipts**: Added QB bill tracking columns
   - qb_bill_id, qb_bill_number, qb_bill_status, qb_bill_synced_at

## Testing Checklist

- [ ] Run database migration
- [ ] Set environment variables
- [ ] Configure webhooks in Intuit Developer Portal
- [ ] Test manual invoice sync with accepted quote
- [ ] Test manual bill sync with allocated receipt
- [ ] Send test webhook from QuickBooks
- [ ] Verify webhook event processing
- [ ] Test cron endpoint with bearer token
- [ ] Verify actual costs appear in report
- [ ] Check sync logs for errors

## Known Limitations

1. **Type Safety**: Using `as any` casts for new DB columns until types regenerated
2. **Vendor Mapping**: Vendors created on-the-fly, no pre-sync
3. **Item Mapping**: Invoice line items use description, not pre-mapped items
4. **Cost Types**: Basic labor/material classification only
5. **Testing**: Requires live QuickBooks connection for full validation

## Future Enhancements (Phase 3)

- Time tracking sync (QB TimeActivity)
- Purchase order sync
- Project budgeting with QB Estimates
- Multi-company support
- Advanced job costing reports
- Item/service catalog sync

## Deployment Steps

1. **Database**: Run migration in Supabase
2. **Environment**: Add webhook token and cron secret
3. **Webhooks**: Configure in Intuit Developer Portal
4. **Deploy**: Push to production with Vercel Cron
5. **Test**: Run manual sync endpoints first
6. **Monitor**: Check sync logs and connection status

## Support

For issues or questions:
- Check sync logs: `qb_sync_logs` table
- Check webhook events: `qb_webhook_events` table  
- Review connection status in Settings → QuickBooks
- Verify environment variables are set correctly
