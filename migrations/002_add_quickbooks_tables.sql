-- Migration: Add QuickBooks Desktop Integration Tables
-- Date: 2025-12-30
-- Description: Add tables for QuickBooks connection, mappings, and sync logs

-- ============================================================
-- QB_CONNECTIONS: Store QuickBooks connection credentials
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qb_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_file_id TEXT, -- QuickBooks company file identifier
  realm_id TEXT UNIQUE NOT NULL, -- Intuit realm ID
  access_token TEXT, -- Encrypted OAuth token
  refresh_token TEXT, -- Encrypted OAuth refresh token
  token_expires_at TIMESTAMPTZ,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle', -- 'idle', 'syncing', 'error'
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Only one connection allowed (singleton)
CREATE UNIQUE INDEX IF NOT EXISTS idx_qb_connections_singleton ON public.qb_connections ((1));

-- Add updated_at trigger
CREATE TRIGGER trg_qb_connections_updated_at
BEFORE UPDATE ON public.qb_connections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- QB_MAPPINGS: Map Zenith entities to QuickBooks entities
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qb_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zenith_entity_type TEXT NOT NULL, -- 'customer', 'work_order', 'quote', 'receipt'
  zenith_entity_id UUID NOT NULL,
  qb_entity_type TEXT NOT NULL, -- 'Customer', 'Invoice', 'Bill', 'Job'
  qb_list_id TEXT NOT NULL, -- QuickBooks ListID
  qb_edit_sequence TEXT, -- QuickBooks EditSequence for optimistic locking
  qb_full_name TEXT, -- QuickBooks FullName (for customers/subcustomers)
  sync_direction TEXT DEFAULT 'bidirectional', -- 'to_qb', 'from_qb', 'bidirectional'
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_mappings_zenith ON public.qb_mappings(zenith_entity_type, zenith_entity_id);
CREATE INDEX IF NOT EXISTS idx_qb_mappings_qb ON public.qb_mappings(qb_entity_type, qb_list_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_qb_mappings_unique ON public.qb_mappings(zenith_entity_type, zenith_entity_id, qb_entity_type);

-- Add updated_at trigger
CREATE TRIGGER trg_qb_mappings_updated_at
BEFORE UPDATE ON public.qb_mappings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- QB_SYNC_LOGS: Track sync operations for debugging
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qb_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'customer_sync', 'invoice_create', 'bill_create', 'payment_update'
  direction TEXT NOT NULL, -- 'to_qb', 'from_qb'
  status TEXT NOT NULL, -- 'success', 'error', 'pending'
  entity_type TEXT,
  entity_id UUID,
  qb_request TEXT, -- QBXML/JSON request (for debugging)
  qb_response TEXT, -- QBXML/JSON response
  error_message TEXT,
  processed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_sync_logs_created_at ON public.qb_sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qb_sync_logs_entity ON public.qb_sync_logs(entity_type, entity_id);

-- ============================================================
-- ALTER WORK_ORDERS: Add qb_subcustomer_name field
-- ============================================================
DO $$ 
BEGIN
  -- Add qb_subcustomer_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'work_orders' 
    AND column_name = 'qb_subcustomer_name'
  ) THEN
    ALTER TABLE public.work_orders ADD COLUMN qb_subcustomer_name TEXT;
  END IF;
END $$;

-- Create index on qb_subcustomer_id if not exists
CREATE INDEX IF NOT EXISTS idx_work_orders_qb_subcustomer ON public.work_orders(qb_subcustomer_id);

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE public.qb_connections IS 'QuickBooks Desktop OAuth connection settings (singleton)';
COMMENT ON TABLE public.qb_mappings IS 'Maps Zenith entities to QuickBooks entities for sync operations';
COMMENT ON TABLE public.qb_sync_logs IS 'Audit log for QuickBooks sync operations';
COMMENT ON COLUMN public.work_orders.qb_subcustomer_name IS 'QuickBooks subcustomer/job display name';
