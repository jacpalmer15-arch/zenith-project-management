-- Migration: Add Phase 2B QuickBooks Financial Sync Tables
-- Date: 2025-12-30
-- Description: Add invoice/bill references, webhook events, and actual costs tracking

-- ============================================================
-- ALTER QUOTES: Add QuickBooks invoice references
-- ============================================================
DO $$ 
BEGIN
  -- Add qb_invoice_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quotes' 
    AND column_name = 'qb_invoice_id'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN qb_invoice_id TEXT;
  END IF;

  -- Add qb_invoice_number if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quotes' 
    AND column_name = 'qb_invoice_number'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN qb_invoice_number TEXT;
  END IF;

  -- Add qb_invoice_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quotes' 
    AND column_name = 'qb_invoice_status'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN qb_invoice_status TEXT;
  END IF;

  -- Add qb_invoice_synced_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quotes' 
    AND column_name = 'qb_invoice_synced_at'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN qb_invoice_synced_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index on qb_invoice_id if not exists
CREATE INDEX IF NOT EXISTS idx_quotes_qb_invoice ON public.quotes(qb_invoice_id);

-- ============================================================
-- ALTER RECEIPTS: Add QuickBooks bill references
-- ============================================================
DO $$ 
BEGIN
  -- Add qb_bill_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'receipts' 
    AND column_name = 'qb_bill_id'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN qb_bill_id TEXT;
  END IF;

  -- Add qb_bill_number if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'receipts' 
    AND column_name = 'qb_bill_number'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN qb_bill_number TEXT;
  END IF;

  -- Add qb_bill_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'receipts' 
    AND column_name = 'qb_bill_status'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN qb_bill_status TEXT;
  END IF;

  -- Add qb_bill_synced_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'receipts' 
    AND column_name = 'qb_bill_synced_at'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN qb_bill_synced_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index on qb_bill_id if not exists
CREATE INDEX IF NOT EXISTS idx_receipts_qb_bill ON public.receipts(qb_bill_id);

-- ============================================================
-- QB_WEBHOOK_EVENTS: Track incoming webhook events from QuickBooks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qb_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id TEXT NOT NULL,
  event_name TEXT NOT NULL, -- 'Invoice', 'Payment', 'Bill', 'Customer'
  event_operation TEXT NOT NULL, -- 'Create', 'Update', 'Delete', 'Merge'
  entity_id TEXT NOT NULL, -- QuickBooks entity ID
  event_time TIMESTAMPTZ NOT NULL,
  webhook_payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_webhook_events_processed ON public.qb_webhook_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_qb_webhook_events_entity ON public.qb_webhook_events(event_name, entity_id);

-- ============================================================
-- QB_ACTUAL_COSTS: Cache actual costs from QuickBooks for reporting
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qb_actual_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL, -- 'labor', 'material', 'equipment', 'subcontractor', 'other'
  actual_amount DECIMAL(10,2) NOT NULL,
  qb_source_type TEXT NOT NULL, -- 'Invoice', 'Bill', 'TimeActivity'
  qb_source_id TEXT NOT NULL,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_actual_costs_work_order ON public.qb_actual_costs(work_order_id);
CREATE INDEX IF NOT EXISTS idx_qb_actual_costs_snapshot ON public.qb_actual_costs(snapshot_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_qb_actual_costs_unique ON public.qb_actual_costs(work_order_id, cost_type, snapshot_date);

-- Add updated_at trigger for qb_actual_costs
CREATE TRIGGER trg_qb_actual_costs_updated_at
BEFORE UPDATE ON public.qb_actual_costs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE public.qb_webhook_events IS 'Tracks incoming webhook events from QuickBooks for payment and entity updates';
COMMENT ON TABLE public.qb_actual_costs IS 'Caches actual costs from QuickBooks for comparing against estimated costs in reporting';
COMMENT ON COLUMN public.quotes.qb_invoice_id IS 'QuickBooks invoice ID linked to this quote';
COMMENT ON COLUMN public.quotes.qb_invoice_status IS 'Status of the invoice in QuickBooks: draft, sent, paid, partial, overdue';
COMMENT ON COLUMN public.receipts.qb_bill_id IS 'QuickBooks bill ID linked to this receipt';
COMMENT ON COLUMN public.receipts.qb_bill_status IS 'Status of the bill in QuickBooks: unpaid, paid, partial';
