-- Migration: Add receipts table
-- Date: 2025-12-31
-- Description: Create receipts table for tracking vendor receipts and their allocation

-- Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT,
  receipt_date DATE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  notes TEXT,
  is_allocated BOOLEAN NOT NULL DEFAULT false,
  allocated_to_work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  allocated_overhead_bucket TEXT,
  qb_source_entity TEXT,
  qb_source_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for receipts
CREATE INDEX IF NOT EXISTS idx_receipts_is_allocated ON public.receipts(is_allocated);
CREATE INDEX IF NOT EXISTS idx_receipts_work_order ON public.receipts(allocated_to_work_order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON public.receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON public.receipts(receipt_date);

-- Enable RLS
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- RLS policies (allow authenticated users full access)
CREATE POLICY "Allow authenticated users to view receipts"
  ON public.receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert receipts"
  ON public.receipts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update receipts"
  ON public.receipts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete receipts"
  ON public.receipts FOR DELETE
  TO authenticated
  USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER receipts_updated_at_trigger
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_receipts_updated_at();

-- Add comments
COMMENT ON TABLE public.receipts IS 'Vendor receipts and their allocation to work orders or overhead buckets';
COMMENT ON COLUMN public.receipts.storage_path IS 'Path to the receipt image/document in storage';
COMMENT ON COLUMN public.receipts.is_allocated IS 'Whether the receipt has been allocated to a work order or overhead bucket';
COMMENT ON COLUMN public.receipts.allocated_overhead_bucket IS 'Overhead category if not allocated to a specific work order';
COMMENT ON COLUMN public.receipts.qb_source_entity IS 'QuickBooks entity type (e.g., Bill, Expense) if imported from QB';
COMMENT ON COLUMN public.receipts.qb_source_id IS 'QuickBooks entity ID if imported from QB';
