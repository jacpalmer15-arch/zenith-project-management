-- Migration: Add audit_logs table and default_labor_rate to settings
-- Date: 2025-12-29
-- Description: Add audit logging infrastructure and default labor rate setting

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE, ACCEPT, REJECT, ALLOCATE, SEND, COMPLETE
  actor_user_id UUID REFERENCES auth.users(id),
  before_data JSONB,
  after_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Add default_labor_rate to settings table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'settings' 
    AND column_name = 'default_labor_rate'
  ) THEN
    ALTER TABLE public.settings ADD COLUMN default_labor_rate NUMERIC(10,2);
  END IF;
END $$;

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'System audit log for tracking key business actions';
COMMENT ON COLUMN public.settings.default_labor_rate IS 'Default labor rate per hour for time entry cost estimation';
