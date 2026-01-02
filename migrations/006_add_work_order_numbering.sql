-- Migration: Add work order numbering support to settings table
-- Date: 2026-01-02
-- Description: Add work_order_number_prefix and next_work_order_seq columns to settings table

-- Add work order numbering fields to settings table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'settings' 
    AND column_name = 'work_order_number_prefix'
  ) THEN
    ALTER TABLE public.settings ADD COLUMN work_order_number_prefix TEXT DEFAULT 'WO-' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'settings' 
    AND column_name = 'next_work_order_seq'
  ) THEN
    ALTER TABLE public.settings ADD COLUMN next_work_order_seq BIGINT DEFAULT 1 NOT NULL;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.settings.work_order_number_prefix IS 'Prefix for auto-generated work order numbers';
COMMENT ON COLUMN public.settings.next_work_order_seq IS 'Next sequence number for work order numbering';
