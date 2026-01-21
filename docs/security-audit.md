# Security Audit (RLS + Policies)

This audit verifies that every table/view used by the UI is protected by RLS and that policies align with the role model (`ADMIN`, `OFFICE`, `TECH`). High‑risk findings are listed first.

## High-Risk Findings (Before Fix)
1. **RLS missing or disabled on core UI tables** (employees, locations, work_orders, work_order_schedule, work_order_time_entries, audit_logs). This allowed broad access through GRANTs without row filtering.
2. **Over‑permissive policies** on many tables (e.g., customers, job_cost_entries, receipts) allowed any authenticated user to read/write everything.
3. **Email-based identity mapping** allowed ambiguous user resolution (no uniqueness guarantees).
4. **Security‑definer RPCs** (`accept_quote`, `get_next_number`) ran without role checks, enabling unauthorized operations.
5. **Missing `audit_log_entries` view** broke audit log UI; view access permissions for receipt allocation views were missing for authenticated roles.

The migration adds role-aware RLS, fills missing views, and constrains RPCs to admin/office.

---

## Role Matrix (Post‑Fix)
Legend: ✅ allowed, ❌ denied, ⚠️ restricted by row‑level ownership.

### audit_logs / audit_log_entries
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ❌ | ❌ | Admin can read audit logs; inserts require `actor_user_id = auth.uid()`. |
| OFFICE | ❌ | ✅ | ❌ | ❌ | Office cannot read logs. |
| TECH | ❌ | ✅ | ❌ | ❌ | Tech cannot read logs. |

### employees
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full employee management. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Employee management. |
| TECH | ⚠️ (self only) | ❌ | ❌ | ❌ | Tech can read own employee row; linking uses a dedicated RPC. |

### customers
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ❌ | Delete is admin only. |
| TECH | ✅ | ❌ | ❌ | ❌ | Read-only access. |

### locations
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ❌ | Delete is admin only. |
| TECH | ✅ | ❌ | ❌ | ❌ | Read-only access. |

### projects
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ❌ | Delete is admin only. |
| TECH | ✅ | ❌ | ❌ | ❌ | Read-only access for dashboard/search. |

### quotes / quote_lines
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ✅ (quotes only) | ❌ | ❌ | ❌ | Quote lines restricted to admin/office. |

### work_orders
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ⚠️ (assigned/scheduled only) | ❌ | ❌ | ❌ | Tech only sees their work orders. |

### work_order_schedule
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ⚠️ (own only) | ❌ | ❌ | ❌ | Tech reads own schedule. |

### work_order_time_entries
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ⚠️ (own only) | ⚠️ (own only) | ⚠️ (own only) | ⚠️ (own only) | Tech can manage only their entries. |

### job_cost_entries
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ❌ | ❌ | ❌ | ❌ | No access. |

### receipts / receipt_line_items / allocation views
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ❌ | ❌ | ❌ | ❌ | No access. |

### parts / part_categories / cost_types / cost_codes
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ✅ (parts only) | ❌ | ❌ | ❌ | Parts read for dashboard; catalogs are admin/office only. |

### inventory_ledger
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ❌ | ❌ | ❌ | ❌ | No access. |

### equipment / equipment_usage
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ❌ | ❌ | ❌ | ❌ | No access. |

### files
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ❌ | ❌ | ❌ | ❌ | No access. |

### tax_rules
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ✅ | ✅ | ✅ | Full access. |
| OFFICE | ✅ | ✅ | ✅ | ✅ | Full access. |
| TECH | ✅ | ❌ | ❌ | ❌ | Read for quote lookups/dashboard. |

### settings
| Role | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| ADMIN | ✅ | ❌ | ✅ | ❌ | Admin-only settings. |
| OFFICE | ❌ | ❌ | ❌ | ❌ | Uses `get_next_number` RPC instead of direct updates. |
| TECH | ❌ | ❌ | ❌ | ❌ | No access. |

---

## View Safety
- `vw_receipt_allocation_status` and `vw_receipt_line_allocation_status` depend on `receipts`, `receipt_line_items`, and `job_cost_entries` RLS. Grants are added to authenticated, and underlying table policies ensure only admin/office rows are visible.
- `audit_log_entries` is a view mapped from `audit_logs` with `security_invoker = true`; access is constrained by `audit_logs` RLS and admin-only role checks.
