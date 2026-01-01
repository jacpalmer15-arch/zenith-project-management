# Audit Log Data Retention Policy

## Overview
The audit logging system captures all create, update, and delete operations on critical business data, particularly `job_cost_entries`. This document outlines the data retention policy for audit logs.

## Retention Requirements

### Minimum Retention Period
- **7 years**: All audit logs must be retained for a minimum of 7 years to meet compliance requirements
- This applies to all tables tracked by the audit logging system

### Storage Strategy

#### Active Storage (Years 0-2)
- Audit logs from the current year and previous 2 years remain in the primary `audit_log_entries` table
- These are immediately accessible for queries and reporting
- Full-text search and filtering capabilities available

#### Archive Storage (Years 3-7)
- Audit logs older than 2 years should be moved to cold storage or an archive table
- Consider using:
  - Separate archive database
  - Compressed storage format
  - Read-only replicas for compliance queries

### Implementation Notes

1. **Never Delete Audit Logs**: Under no circumstances should audit logs be deleted
   - Even after the 7-year retention period, consider archiving rather than deleting
   - If deletion is legally required after 7 years, ensure proper approval process

2. **Automated Archival**: 
   - Set up a scheduled job to archive logs older than 2 years
   - Run monthly or quarterly depending on data volume
   - Example cron job:
     ```sql
     -- Create archive table if needed
     CREATE TABLE IF NOT EXISTS audit_log_entries_archive (LIKE audit_log_entries);
     
     -- Move old records
     INSERT INTO audit_log_entries_archive 
     SELECT * FROM audit_log_entries 
     WHERE created_at < NOW() - INTERVAL '2 years';
     
     -- Delete from active table (only after successful archive)
     DELETE FROM audit_log_entries 
     WHERE created_at < NOW() - INTERVAL '2 years';
     ```

3. **Backup Strategy**:
   - Regular database backups include audit logs
   - Test restoration procedures periodically
   - Maintain backup retention aligned with audit log retention policy

4. **Access Controls**:
   - Only admin users can access audit logs via the UI
   - Database-level access restricted to necessary personnel
   - Log all access to archived audit data

## Monitoring

- Track audit log table size monthly
- Alert when storage exceeds 80% capacity
- Review archival process success/failure
- Monitor query performance as table grows

## Compliance Notes

This retention policy is designed to meet general compliance requirements. Consult with your legal team to ensure it meets your specific industry regulations:
- SOX compliance
- GDPR (if applicable)
- Industry-specific requirements (HIPAA, PCI-DSS, etc.)

## Review Schedule

This policy should be reviewed annually or when:
- Regulatory requirements change
- Business needs evolve
- Storage costs become prohibitive
- Compliance issues arise
