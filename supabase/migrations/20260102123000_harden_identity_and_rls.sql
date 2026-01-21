-- Risk fix: make employee identity deterministic (auth.uid) and unique
-- Rationale: remove ambiguous email matching and ensure stable identity mapping
alter table public.employees
  add column if not exists user_id uuid;

do $$
begin
  if exists (
    select lower(email)
    from public.employees
    where email is not null
    group by lower(email)
    having count(*) > 1
  ) then
    raise exception 'Duplicate employee emails detected; resolve before enforcing uniqueness.';
  end if;
end $$;

create unique index if not exists employees_email_unique_lower
  on public.employees (lower(email))
  where email is not null;

update public.employees e
set user_id = u.id
from auth.users u
where e.user_id is null
  and e.email is not null
  and lower(e.email) = lower(u.email);

create unique index if not exists employees_user_id_unique
  on public.employees (user_id)
  where user_id is not null;

alter table public.employees
  add constraint employees_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete set null;

-- Risk fix: enforce singleton settings row for deterministic numbering
alter table public.settings
  add column if not exists is_singleton boolean not null default true;

do $$
begin
  if (select count(*) from public.settings) > 1 then
    raise exception 'Multiple settings rows detected; consolidate before enforcing singleton.';
  end if;
end $$;

create unique index if not exists settings_singleton_unique
  on public.settings (is_singleton);

-- Risk fix: helper functions use auth.uid instead of email
create or replace function public.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.id
  from public.employees e
  where e.user_id = auth.uid();
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
  where e.user_id = auth.uid();
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

-- Safe employee linkage using auth.uid (no direct update privileges needed)
create or replace function public.link_employee_user_id()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  emp_id uuid;
begin
  if auth.uid() is null then
    return null;
  end if;

  select id
  into emp_id
  from public.employees
  where user_id is null
    and email is not null
    and lower(email) = lower(auth.jwt() ->> 'email');

  if emp_id is null then
    return null;
  end if;

  update public.employees
  set user_id = auth.uid()
  where id = emp_id;

  return emp_id;
end;
$$;

grant execute on function public.link_employee_user_id() to authenticated;

-- Risk fix: prevent audit log poisoning
alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_insert_authenticated on public.audit_logs;
drop policy if exists audit_logs_select_admin on public.audit_logs;

create policy audit_logs_insert_actor_only
  on public.audit_logs
  for insert
  to authenticated
  with check (actor_user_id = auth.uid());

create policy audit_logs_select_admin
  on public.audit_logs
  for select
  to authenticated
  using (public.is_admin());

-- Identity-safe employee policies
alter table public.employees enable row level security;

drop policy if exists employees_select_admin_office on public.employees;
drop policy if exists employees_select_self on public.employees;
drop policy if exists employees_insert_admin_office on public.employees;
drop policy if exists employees_update_admin_office on public.employees;
drop policy if exists employees_delete_admin_office on public.employees;


create policy employees_select_admin_office
  on public.employees
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy employees_select_self
  on public.employees
  for select
  to authenticated
  using (user_id = auth.uid());

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

-- Work order time entry policies: enforce tech ownership + assignment
alter table public.work_order_time_entries enable row level security;

drop policy if exists work_order_time_entries_select_admin_office on public.work_order_time_entries;
drop policy if exists work_order_time_entries_select_tech on public.work_order_time_entries;
drop policy if exists work_order_time_entries_insert_admin_office on public.work_order_time_entries;
drop policy if exists work_order_time_entries_insert_tech on public.work_order_time_entries;
drop policy if exists work_order_time_entries_update_admin_office on public.work_order_time_entries;
drop policy if exists work_order_time_entries_update_tech on public.work_order_time_entries;
drop policy if exists work_order_time_entries_delete_admin_office on public.work_order_time_entries;
drop policy if exists work_order_time_entries_delete_tech on public.work_order_time_entries;

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
  with check (
    tech_user_id = public.current_employee_id()
    and exists (
      select 1
      from public.work_orders wo
      where wo.id = work_order_time_entries.work_order_id
        and (
          wo.assigned_to = public.current_employee_id()
          or exists (
            select 1
            from public.work_order_schedule s
            where s.work_order_id = work_order_time_entries.work_order_id
              and s.tech_user_id = public.current_employee_id()
          )
        )
    )
  );

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
  with check (
    tech_user_id = public.current_employee_id()
    and exists (
      select 1
      from public.work_orders wo
      where wo.id = work_order_time_entries.work_order_id
        and (
          wo.assigned_to = public.current_employee_id()
          or exists (
            select 1
            from public.work_order_schedule s
            where s.work_order_id = work_order_time_entries.work_order_id
              and s.tech_user_id = public.current_employee_id()
          )
        )
    )
  );

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

-- Replace broad FOR ALL policies with explicit operations (examples)
-- Cost codes
alter table public.cost_codes enable row level security;

drop policy if exists cost_codes_select_admin_office on public.cost_codes;
drop policy if exists cost_codes_write_admin_office on public.cost_codes;

create policy cost_codes_select_admin_office
  on public.cost_codes
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy cost_codes_insert_admin_office
  on public.cost_codes
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy cost_codes_update_admin_office
  on public.cost_codes
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy cost_codes_delete_admin_office
  on public.cost_codes
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Cost types
alter table public.cost_types enable row level security;

drop policy if exists cost_types_select_admin_office on public.cost_types;
drop policy if exists cost_types_write_admin_office on public.cost_types;

create policy cost_types_select_admin_office
  on public.cost_types
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy cost_types_insert_admin_office
  on public.cost_types
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy cost_types_update_admin_office
  on public.cost_types
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy cost_types_delete_admin_office
  on public.cost_types
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Part categories
alter table public.part_categories enable row level security;

drop policy if exists part_categories_select_admin_office on public.part_categories;
drop policy if exists part_categories_write_admin_office on public.part_categories;

create policy part_categories_select_admin_office
  on public.part_categories
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy part_categories_insert_admin_office
  on public.part_categories
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy part_categories_update_admin_office
  on public.part_categories
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy part_categories_delete_admin_office
  on public.part_categories
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Parts
alter table public.parts enable row level security;

drop policy if exists parts_select_authenticated on public.parts;
drop policy if exists parts_write_admin_office on public.parts;

create policy parts_select_authenticated
  on public.parts
  for select
  to authenticated
  using (true);

create policy parts_insert_admin_office
  on public.parts
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy parts_update_admin_office
  on public.parts
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy parts_delete_admin_office
  on public.parts
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Inventory ledger
alter table public.inventory_ledger enable row level security;

drop policy if exists inventory_ledger_select_admin_office on public.inventory_ledger;
drop policy if exists inventory_ledger_write_admin_office on public.inventory_ledger;

create policy inventory_ledger_select_admin_office
  on public.inventory_ledger
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy inventory_ledger_insert_admin_office
  on public.inventory_ledger
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy inventory_ledger_update_admin_office
  on public.inventory_ledger
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy inventory_ledger_delete_admin_office
  on public.inventory_ledger
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Job cost entries
alter table public.job_cost_entries enable row level security;

drop policy if exists job_cost_entries_select_admin_office on public.job_cost_entries;
drop policy if exists job_cost_entries_write_admin_office on public.job_cost_entries;

create policy job_cost_entries_select_admin_office
  on public.job_cost_entries
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy job_cost_entries_insert_admin_office
  on public.job_cost_entries
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy job_cost_entries_update_admin_office
  on public.job_cost_entries
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy job_cost_entries_delete_admin_office
  on public.job_cost_entries
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Receipts
alter table public.receipts enable row level security;

drop policy if exists receipts_select_admin_office on public.receipts;
drop policy if exists receipts_write_admin_office on public.receipts;

create policy receipts_select_admin_office
  on public.receipts
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy receipts_insert_admin_office
  on public.receipts
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy receipts_update_admin_office
  on public.receipts
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy receipts_delete_admin_office
  on public.receipts
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Receipt line items
alter table public.receipt_line_items enable row level security;

drop policy if exists receipt_line_items_select_admin_office on public.receipt_line_items;
drop policy if exists receipt_line_items_write_admin_office on public.receipt_line_items;

create policy receipt_line_items_select_admin_office
  on public.receipt_line_items
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy receipt_line_items_insert_admin_office
  on public.receipt_line_items
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy receipt_line_items_update_admin_office
  on public.receipt_line_items
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy receipt_line_items_delete_admin_office
  on public.receipt_line_items
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Files
alter table public.files enable row level security;

drop policy if exists files_select_admin_office on public.files;
drop policy if exists files_write_admin_office on public.files;

create policy files_select_admin_office
  on public.files
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy files_insert_admin_office
  on public.files
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy files_update_admin_office
  on public.files
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy files_delete_admin_office
  on public.files
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Equipment
alter table public.equipment enable row level security;

drop policy if exists equipment_select_admin_office on public.equipment;
drop policy if exists equipment_write_admin_office on public.equipment;

create policy equipment_select_admin_office
  on public.equipment
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy equipment_insert_admin_office
  on public.equipment
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy equipment_update_admin_office
  on public.equipment
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy equipment_delete_admin_office
  on public.equipment
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Equipment usage
alter table public.equipment_usage enable row level security;

drop policy if exists equipment_usage_select_admin_office on public.equipment_usage;
drop policy if exists equipment_usage_write_admin_office on public.equipment_usage;

create policy equipment_usage_select_admin_office
  on public.equipment_usage
  for select
  to authenticated
  using (public.is_admin_or_office());

create policy equipment_usage_insert_admin_office
  on public.equipment_usage
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy equipment_usage_update_admin_office
  on public.equipment_usage
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy equipment_usage_delete_admin_office
  on public.equipment_usage
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Tax rules
alter table public.tax_rules enable row level security;

drop policy if exists tax_rules_select_authenticated on public.tax_rules;
drop policy if exists tax_rules_write_admin_office on public.tax_rules;

create policy tax_rules_select_authenticated
  on public.tax_rules
  for select
  to authenticated
  using (true);

create policy tax_rules_insert_admin_office
  on public.tax_rules
  for insert
  to authenticated
  with check (public.is_admin_or_office());

create policy tax_rules_update_admin_office
  on public.tax_rules
  for update
  to authenticated
  using (public.is_admin_or_office())
  with check (public.is_admin_or_office());

create policy tax_rules_delete_admin_office
  on public.tax_rules
  for delete
  to authenticated
  using (public.is_admin_or_office());

-- Settings
alter table public.settings enable row level security;

drop policy if exists settings_select_admin on public.settings;
drop policy if exists settings_update_admin on public.settings;

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
