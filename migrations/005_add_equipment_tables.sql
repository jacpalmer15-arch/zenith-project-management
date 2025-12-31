-- Migration: Add equipment and equipment_usage tables
-- Date: 2025-12-31
-- Description: Create equipment tracking tables for billing equipment usage to work orders

-- Create equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  serial_no TEXT,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create equipment_usage table
CREATE TABLE IF NOT EXISTS public.equipment_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  billed_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for equipment
CREATE INDEX IF NOT EXISTS idx_equipment_is_active ON public.equipment(is_active);
CREATE INDEX IF NOT EXISTS idx_equipment_name ON public.equipment(name);

-- Create indexes for equipment_usage
CREATE INDEX IF NOT EXISTS idx_equipment_usage_work_order ON public.equipment_usage(work_order_id);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_equipment ON public.equipment_usage(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_start_at ON public.equipment_usage(start_at);

-- Enable RLS on equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view equipment"
  ON public.equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert equipment"
  ON public.equipment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update equipment"
  ON public.equipment FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete equipment"
  ON public.equipment FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on equipment_usage
ALTER TABLE public.equipment_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view equipment_usage"
  ON public.equipment_usage FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert equipment_usage"
  ON public.equipment_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update equipment_usage"
  ON public.equipment_usage FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete equipment_usage"
  ON public.equipment_usage FOR DELETE
  TO authenticated
  USING (true);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_updated_at_trigger
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_updated_at();

CREATE OR REPLACE FUNCTION update_equipment_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_usage_updated_at_trigger
  BEFORE UPDATE ON public.equipment_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_usage_updated_at();

-- Add comments
COMMENT ON TABLE public.equipment IS 'Equipment inventory with hourly and daily rates for billing';
COMMENT ON TABLE public.equipment_usage IS 'Equipment usage records linked to work orders';
COMMENT ON COLUMN public.equipment.hourly_rate IS 'Rate charged per hour of equipment usage';
COMMENT ON COLUMN public.equipment.daily_rate IS 'Rate charged per day of equipment usage';
COMMENT ON COLUMN public.equipment_usage.billed_rate IS 'The rate applied for this usage (hourly or daily)';
COMMENT ON COLUMN public.equipment_usage.cost_total IS 'Total cost calculated for this usage entry';
