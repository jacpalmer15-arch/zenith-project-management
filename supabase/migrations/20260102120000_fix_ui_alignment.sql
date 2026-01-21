-- Helper functions for role-aware RLS
create or replace function public.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.id
  from public.employees e
  where lower(e.email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

create or replace function public.current_employee_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select upper(e.role)
  from public.employees e
  where lower(e.email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((public.current_employee_role() = 'ADMIN'), false);
$$;

create or replace function public.is_admin_or_office()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((public.current_employee_role() in ('ADMIN', 'OFFICE')), false);
$$;

create or replace function public.get_user_email(p_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return null;
  end if;

  return (select email from auth.users where id = p_user_id);
end;
$$;

grant execute on function public.get_user_email(uuid) to authenticated;

-- Settings: add work order sequence support
alter table public.settings
  add column if not exists work_order_number_prefix text not null default 'WO-';

alter table public.settings
  add column if not exists next_work_order_seq bigint not null default 1;

-- Secure functions that mutate data
create or replace function public.get_next_number(p_kind text) returns text
    language plpgsql
    security definer
    set search_path to 'public'
as $$
declare
  s public.settings%rowtype;
  out_no text;
begin
  if not public.is_admin_or_office() then
    raise exception 'permission denied';
  end if;

  select * into s from public.settings limit 1 for update;

  if p_kind = 'customer' then
    out_no := s.customer_number_prefix || lpad(s.next_customer_seq::text, 6, '0');
    update public.settings
      set next_customer_seq = next_customer_seq + 1
      where id = s.id;
    return out_no;

  elsif p_kind = 'project' then
    out_no := s.project_number_prefix || lpad(s.next_project_seq::text, 6, '0');
    update public.settings
      set next_project_seq = next_project_seq + 1
      where id = s.id;
    return out_no;

  elsif p_kind = 'quote' then
    out_no := s.quote_number_prefix || lpad(s.next_quote_seq::text, 6, '0');
    update public.settings
      set next_quote_seq = next_quote_seq + 1
      where id = s.id;
    return out_no;

  elsif p_kind = 'work_order' then
    out_no := s.work_order_number_prefix || lpad(s.next_work_order_seq::text, 6, '0');
    update public.settings
      set next_work_order_seq = next_work_order_seq + 1
      where id = s.id;
    return out_no;

  else
    raise exception 'Unknown kind: %', p_kind;
  end if;
end $$;

create or replace function public.accept_quote(p_quote_id uuid) returns void
    language plpgsql
    security definer
    set search_path to 'public'
as $$
declare
  q public.quotes%rowtype;
  base_total numeric(12,2);
  co_total   numeric(12,2);
begin
  if not public.is_admin_or_office() then
    raise exception 'permission denied';
  end if;

  select * into q
  from public.quotes
  where id = p_quote_id
  for update;

  if not found then
    raise exception 'Quote not found';
  end if;

  -- idempotent
  if q.status = 'ACCEPTED' then
    return;
  end if;

  -- One accepted BASE per project (unique index should also protect this)
  if q.quote_type = 'BASE' then
    perform 1
    from public.quotes
    where project_id = q.project_id
      and quote_type = 'BASE'
      and status = 'ACCEPTED';

    if found then
      raise exception 'This project already has an accepted BASE quote.';
    end if;
  end if;

  -- Set accepted status + snapshot tax rate
  update public.quotes
  set status = 'ACCEPTED',
      accepted_at = now(),
      tax_rate_snapshot = (select rate from public.tax_rules where id = q.tax_rule_id)
  where id = p_quote_id;

  -- Recompute project contract rollups from accepted quotes
  select coalesce(sum(total_amount), 0) into base_total
  from public.quotes
  where project_id = q.project_id
    and quote_type = 'BASE'
    and status = 'ACCEPTED';

  select coalesce(sum(total_amount), 0) into co_total
  from public.quotes
  where project_id = q.project_id
    and quote_type = 'CHANGE_ORDER'
    and status = 'ACCEPTED';

  update public.projects
  set base_contract_amount = base_total,
      change_order_amount = co_total,
      contract_amount = base_total + co_total,
      status = 'Active'
  where id = q.project_id;
end $$;

-- Audit log view expected by the UI
create or replace view public.audit_log_entries as
select
  l.id,
  l.entity_type as table_name,
  l.entity_id::text as record_id,
  case
    when l.action in ('CREATE', 'INSERT') then 'INSERT'
    when l.action = 'DELETE' then 'DELETE'
    else 'UPDATE'
  end as action,
  l.before_data as old_values,
  l.after_data as new_values,
  case
    when l.before_data is null or l.after_data is null then null
    else (
      select array_agg(key)
      from jsonb_each_text(l.after_data) as e(key, value)
      where l.before_data ->> key is distinct from value
    )
  end as changed_fields,
  l.actor_user_id as user_id,
  public.get_user_email(l.actor_user_id) as user_email,
  l.notes as reason,
  l.created_at
from public.audit_logs l;

alter view public.audit_log_entries set (security_invoker = true);

grant select on public.audit_log_entries to authenticated;

-- Ensure receipt allocation views are readable
grant select on public.vw_receipt_allocation_status to authenticated;
grant select on public.vw_receipt_line_allocation_status to authenticated;

-- Enable RLS for missing tables
alter table if exists public.audit_logs enable row level security;
alter table if exists public.employees enable row level security;
alter table if exists public.locations enable row level security;
alter table if exists public.work_orders enable row level security;
alter table if exists public.work_order_schedule enable row level security;
alter table if exists public.work_order_time_entries enable row level security;

-- Drop legacy policies
drop policy if exists "Allow authenticated users to delete equipment" on public.equipment;
drop policy if exists "Allow authenticated users to delete equipment_usage" on public.equipment_usage;
drop policy if exists "Allow authenticated users to delete receipts" on public.receipts;
drop policy if exists "Allow authenticated users to insert equipment" on public.equipment;
drop policy if exists "Allow authenticated users to insert equipment_usage" on public.equipment_usage;
drop policy if exists "Allow authenticated users to insert receipts" on public.receipts;
drop policy if exists "Allow authenticated users to update equipment" on public.equipment;
drop policy if exists "Allow authenticated users to update equipment_usage" on public.equipment_usage;
drop policy if exists "Allow authenticated users to update receipts" on public.receipts;
drop policy if exists "Allow authenticated users to view equipment" on public.equipment;
drop policy if exists "Allow authenticated users to view equipment_usage" on public.equipment_usage;
drop policy if exists "Allow authenticated users to view receipts" on public.receipts;
drop policy if exists auth_read_write_cost_codes on public.cost_codes;
drop policy if exists auth_read_write_cost_types on public.cost_types;
drop policy if exists auth_read_write_customers on public.customers;
drop policy if exists auth_read_write_files on public.files;
drop policy if exists auth_read_write_inventory_ledger on public.inventory_ledger;
drop policy if exists auth_read_write_job_cost_entries on public.job_cost_entries;
drop policy if exists auth_read_write_part_categories on public.part_categories;
drop policy if exists auth_read_write_parts on public.parts;
drop policy if exists auth_read_write_projects on public.projects;
drop policy if exists auth_read_write_quote_lines on public.quote_lines;
drop policy if exists auth_read_write_quotes on public.quotes;
drop policy if exists auth_read_write_receipt_line_items on public.receipt_line_items;
drop policy if exists auth_read_write_settings on public.settings;
drop policy if exists auth_read_write_tax_rules on public.tax_rules;

-- Audit logs
create policy audit_logs_insert_authenticated
  on public.audit_logs
  for insert
  to authenticated
  with check (true);

create policy audit_logs_select_admin
  on public.audit_logs
  for select
  to authenticated
  using (public.is_admin());

-- Employees
create policy employees_select_admin_office
  on public.employees
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy employees_select_self
  on public.employees
  for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy employees_insert_admin_office
  on public.employees
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy employees_update_admin_office
  on public.employees
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy employees_delete_admin_office
  on public.employees
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Customers
create policy customers_select_authenticated
  on public.customers
  for select
  to authenticated
  using (true);

create policy customers_insert_admin_office
  on public.customers
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy customers_update_admin_office
  on public.customers
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy customers_delete_admin
  on public.customers
  for delete
  to authenticated
  using (public.is_admin());

-- Locations
create policy locations_select_authenticated
  on public.locations
  for select
  to authenticated
  using (true);

create policy locations_insert_admin_office
  on public.locations
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy locations_update_admin_office
  on public.locations
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy locations_delete_admin
  on public.locations
  for delete
  to authenticated
  using (public.is_admin());

-- Projects
create policy projects_select_authenticated
  on public.projects
  for select
  to authenticated
  using (true);

create policy projects_insert_admin_office
  on public.projects
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy projects_update_admin_office
  on public.projects
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy projects_delete_admin
  on public.projects
  for delete
  to authenticated
  using (public.is_admin());

-- Quotes
create policy quotes_select_authenticated
  on public.quotes
  for select
  to authenticated
  using (true);

create policy quotes_insert_admin_office
  on public.quotes
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy quotes_update_admin_office
  on public.quotes
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy quotes_delete_admin_office
  on public.quotes
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Quote lines
create policy quote_lines_select_admin_office
  on public.quote_lines
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy quote_lines_insert_admin_office
  on public.quote_lines
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy quote_lines_update_admin_office
  on public.quote_lines
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy quote_lines_delete_admin_office
  on public.quote_lines
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Work orders
create policy work_orders_select_admin_office
  on public.work_orders
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy work_orders_select_tech
  on public.work_orders
  for select
  to authenticated
  using (
    assigned_to = public.current_employee_id()
    or exists (
      select 1
      from public.work_order_schedule s
      where s.work_order_id = work_orders.id
        and s.tech_user_id = public.current_employee_id()
    )
  );

create policy work_orders_insert_admin_office
  on public.work_orders
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy work_orders_update_admin_office
  on public.work_orders
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy work_orders_delete_admin_office
  on public.work_orders
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Work order schedule
create policy work_order_schedule_select_admin_office
  on public.work_order_schedule
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy work_order_schedule_select_tech
  on public.work_order_schedule
  for select
  to authenticated
  using (tech_user_id = public.current_employee_id());

create policy work_order_schedule_insert_admin_office
  on public.work_order_schedule
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy work_order_schedule_update_admin_office
  on public.work_order_schedule
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy work_order_schedule_delete_admin_office
  on public.work_order_schedule
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Work order time entries
create policy work_order_time_entries_select_admin_office
  on public.work_order_time_entries
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy work_order_time_entries_select_tech
  on public.work_order_time_entries
  for select
  to authenticated
  using (tech_user_id = public.current_employee_id());

create policy work_order_time_entries_insert_admin_office
  on public.work_order_time_entries
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy work_order_time_entries_insert_tech
  on public.work_order_time_entries
  for insert
  to authenticated
  with check (tech_user_id = public.current_employee_id());

create policy work_order_time_entries_update_admin_office
  on public.work_order_time_entries
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy work_order_time_entries_update_tech
  on public.work_order_time_entries
  for update
  to authenticated
  using (tech_user_id = public.current_employee_id())
  with check (tech_user_id = public.current_employee_id());

create policy work_order_time_entries_delete_admin_office
  on public.work_order_time_entries
  for delete
  to authenticated
  using (public.is_admin_or_office());

create policy work_order_time_entries_delete_tech
  on public.work_order_time_entries
  for delete
  to authenticated
  using (tech_user_id = public.current_employee_id());

-- Cost codes & types
create policy cost_codes_select_admin_office
  on public.cost_codes
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy cost_codes_write_admin_office
  on public.cost_codes
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy cost_types_select_admin_office
  on public.cost_types
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy cost_types_write_admin_office
  on public.cost_types
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Part categories & parts
create policy part_categories_select_admin_office
  on public.part_categories
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy part_categories_write_admin_office
  on public.part_categories
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy parts_select_authenticated
  on public.parts
  for select
  to authenticated
  using (true);

create policy parts_write_admin_office
  on public.parts
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Inventory ledger
create policy inventory_ledger_select_admin_office
  on public.inventory_ledger
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy inventory_ledger_write_admin_office
  on public.inventory_ledger
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Job cost entries
create policy job_cost_entries_select_admin_office
  on public.job_cost_entries
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy job_cost_entries_write_admin_office
  on public.job_cost_entries
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Receipts & line items
create policy receipts_select_admin_office
  on public.receipts
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy receipts_write_admin_office
  on public.receipts
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy receipt_line_items_select_admin_office
  on public.receipt_line_items
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy receipt_line_items_write_admin_office
  on public.receipt_line_items
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Files
create policy files_select_admin_office
  on public.files
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy files_write_admin_office
  on public.files
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Equipment
create policy equipment_select_admin_office
  on public.equipment
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy equipment_write_admin_office
  on public.equipment
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy equipment_usage_select_admin_office
  on public.equipment_usage
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy equipment_usage_write_admin_office
  on public.equipment_usage
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Tax rules
create policy tax_rules_select_authenticated
  on public.tax_rules
  for select
  to authenticated
  using (true);

create policy tax_rules_write_admin_office
  on public.tax_rules
  for all
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

-- Settings
create policy settings_select_admin
  on public.settings
  for select
  to authenticated
  using (public.is_admin());

create policy settings_update_admin
  on public.settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Performance indexes for primary filters
create index if not exists idx_work_orders_assigned_to on public.work_orders (assigned_to);
create index if not exists idx_time_entries_tech_user on public.work_order_time_entries (tech_user_id);
create index if not exists idx_time_entries_clock_in_at on public.work_order_time_entries (clock_in_at desc);
