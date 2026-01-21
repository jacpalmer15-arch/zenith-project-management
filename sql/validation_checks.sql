-- Validation checks for RLS and workflow queries
-- Run in a transaction so test data can be rolled back.

begin;

-- Seed data as a superuser (or service_role)
set local role postgres;

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'office@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'tech@example.com')
on conflict (id) do nothing;

insert into public.employees (id, user_id, display_name, email, role, is_active)
values
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@example.com', 'ADMIN', true),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Office User', 'office@example.com', 'OFFICE', true),
  ('cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Tech User', 'tech@example.com', 'TECH', true);

insert into public.customers (id, customer_no, name)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'C-000001', 'Acme Corp');

insert into public.locations (id, customer_id, street, city, state, zip)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1 Main', 'Town', 'TX', '75001');

insert into public.work_orders (id, customer_id, location_id, work_order_no, assigned_to, summary)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'WO-000001', 'cccc3333-3333-3333-3333-333333333333', 'Test WO');

insert into public.work_order_schedule (id, work_order_id, tech_user_id, start_at, end_at)
values ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccc3333-3333-3333-3333-333333333333', now(), now() + interval '2 hours');

insert into public.work_order_time_entries (id, work_order_id, tech_user_id, clock_in_at, break_minutes)
values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccc3333-3333-3333-3333-333333333333', now() - interval '1 hour', 0);

-- Ensure settings row exists for get_next_number
insert into public.settings (id, company_name)
select 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Zenith Co'
where not exists (select 1 from public.settings);

-- Admin session
set local role authenticated;
set local request.jwt.claims = jsonb_build_object('email', 'admin@example.com', 'sub', '11111111-1111-1111-1111-111111111111');

-- Expect: admin can read customers, work orders, time entries
select count(*) as admin_customers from public.customers;
select count(*) as admin_work_orders from public.work_orders;
select count(*) as admin_time_entries from public.work_order_time_entries;

-- Expect: admin can generate work order numbers
select public.get_next_number('work_order') as admin_work_order_no;

-- Office session
set local request.jwt.claims = jsonb_build_object('email', 'office@example.com', 'sub', '22222222-2222-2222-2222-222222222222');

-- Expect: office can read customers
select count(*) as office_customers from public.customers;

-- Expect: office can insert time entries for any tech (office staff)
insert into public.work_order_time_entries (work_order_id, tech_user_id, clock_in_at, break_minutes)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccc3333-3333-3333-3333-333333333333', now() - interval '2 hours', 0);

-- Tech session
set local request.jwt.claims = jsonb_build_object('email', 'tech@example.com', 'sub', '33333333-3333-3333-3333-333333333333');

-- Expect: tech sees only assigned work orders
select count(*) as tech_work_orders from public.work_orders;

-- Expect: tech can see own time entries only
select count(*) as tech_time_entries from public.work_order_time_entries where tech_user_id = public.current_employee_id();

-- Expect: tech cannot update work orders (should affect 0 rows)
update public.work_orders set summary = 'Nope' where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Expect: tech cannot read receipts
select count(*) as tech_receipts from public.receipts;

rollback;
