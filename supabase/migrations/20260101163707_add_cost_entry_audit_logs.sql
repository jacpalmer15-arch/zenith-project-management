-- Add audit_log_entries table for comprehensive audit logging
-- This extends the existing audit_logs table with more detailed tracking

CREATE TABLE IF NOT EXISTS audit_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_log_table_record ON audit_log_entries(table_name, record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log_entries(created_at DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log_entries(user_id);
CREATE INDEX idx_audit_log_action ON audit_log_entries(action);

-- Database trigger function for automatic logging
CREATE OR REPLACE FUNCTION log_job_cost_entry_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields TEXT[];
  v_old_json JSONB;
  v_new_json JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_new_json := to_jsonb(NEW);
    
    INSERT INTO audit_log_entries (
      table_name, 
      record_id, 
      action, 
      new_values, 
      user_id,
      user_email
    )
    VALUES (
      'job_cost_entries', 
      NEW.id, 
      'INSERT', 
      v_new_json, 
      auth.uid(),
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'email')::text,
        'system'
      )
    );
    RETURN NEW;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    
    -- Calculate changed fields (including removed fields)
    SELECT array_agg(DISTINCT key)
    INTO v_changed_fields
    FROM (
      SELECT key FROM jsonb_each(v_new_json)
      WHERE v_new_json->key IS DISTINCT FROM v_old_json->key
      UNION
      SELECT key FROM jsonb_each(v_old_json)
      WHERE v_old_json->key IS DISTINCT FROM v_new_json->key
    ) AS changed_keys;
    
    INSERT INTO audit_log_entries (
      table_name, 
      record_id, 
      action, 
      old_values, 
      new_values,
      changed_fields,
      user_id,
      user_email
    )
    VALUES (
      'job_cost_entries', 
      NEW.id, 
      'UPDATE', 
      v_old_json, 
      v_new_json, 
      v_changed_fields,
      auth.uid(),
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'email')::text,
        'system'
      )
    );
    RETURN NEW;
    
  ELSIF (TG_OP = 'DELETE') THEN
    v_old_json := to_jsonb(OLD);
    
    INSERT INTO audit_log_entries (
      table_name, 
      record_id, 
      action, 
      old_values, 
      user_id,
      user_email
    )
    VALUES (
      'job_cost_entries', 
      OLD.id, 
      'DELETE', 
      v_old_json, 
      auth.uid(),
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'email')::text,
        'system'
      )
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on job_cost_entries table
CREATE TRIGGER job_cost_entries_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON job_cost_entries
  FOR EACH ROW EXECUTE FUNCTION log_job_cost_entry_changes();

-- Grant permissions
GRANT SELECT ON audit_log_entries TO authenticated;
GRANT INSERT ON audit_log_entries TO authenticated;

-- Add RLS policies
ALTER TABLE audit_log_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can see all audit logs
CREATE POLICY "Admin can view all audit logs"
  ON audit_log_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.email = auth.jwt()->>'email'
      AND employees.role = 'ADMIN'
    )
  );

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_log_entries
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_log_entries
  FOR INSERT
  WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE audit_log_entries IS 'Detailed audit trail for job_cost_entries and other critical tables';
COMMENT ON COLUMN audit_log_entries.changed_fields IS 'Array of field names that changed in an UPDATE operation';
COMMENT ON COLUMN audit_log_entries.reason IS 'Optional user-provided reason for the change';
