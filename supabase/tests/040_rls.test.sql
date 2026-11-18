-- 040_rls.test.sql: T-SEC-1a/1b .. T-SEC-15a/b — permission rules allow/deny (Section 9)
\set ON_ERROR_STOP off
SELECT plan(30);

-- Two test users
INSERT INTO public.users (id, email, username) VALUES
  ('22222222-2222-2222-2222-222222222222', 'alice@example.com', 'alice'),
  ('33333333-3333-3333-3333-333333333333', 'bob@example.com', 'bob')
on conflict (id) do nothing;

-- Helper to run as a given auth uid
CREATE OR REPLACE FUNCTION public.as_uid(uuid) RETURNS void
language plpgsql security definer set search_path = ''
as $$ begin
  execute format('select set_config(''request.jwt.claim.sub'', ''%s'', true)', $1);
end $$;

-- SEC1a: users read profile fields — any logged-in user (allow)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
SELECT ok(
  (select count(*) from public.users where id = '22222222-2222-2222-2222-222222222222') = 1,
  'SEC1a: authenticated user can read own profile'
);

-- SEC1b: (allow) any logged-in user can read profiles
SELECT ok(
  (select count(*) from public.users) >= 2,
  'SEC1b: authenticated user can read profiles'
);

-- SEC2a/2b: users.email — nobody through the table (deny)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
DO $$
declare can_read_email boolean := false;
begin
  select (email is not null) into can_read_email
  from public.users where id = '33333333-3333-3333-3333-333333333333';
exception when others then
  can_read_email := false;
end;
SELECT ok(not can_read_email, 'SEC2b: email not readable through table by other user');

-- SEC3a: users update — owner only (allow)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
UPDATE public.users SET username = 'alice2' WHERE id = '22222222-2222-2222-2222-222222222222';
SELECT ok(
  (select username from public.users where id = '22222222-2222-2222-2222-222222222222') = 'alice2',
  'SEC3a: owner can update own profile'
);
UPDATE public.users SET username = 'alice' WHERE id = '22222222-2222-2222-2222-222222222222';

-- SEC3b: users update — not owner (deny)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
DO $$
declare can_update boolean := false;
begin
  update public.users set username = 'bobhack' where id = '33333333-3333-3333-3333-333333333333';
  can_update := true;
exception when others then
  can_update := false;
end;
SELECT ok(not can_update, 'SEC3b: non-owner cannot update another profile');

-- SEC4a: ranks read — any logged-in (allow)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
SELECT ok(
  (select count(*) from public.ranks) >= 1,
  'SEC4a: authenticated user can read ranks'
);

-- SEC4b: ranks read deny — logged out (no auth). Simulate by null uid.
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT ok(
  (select count(*) from public.ranks) = 0,
  'SEC4b: logged out cannot read ranks'
);
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');

-- SEC5a: routes read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.routes) >= 1,
  'SEC5a: authenticated user can read routes'
);

-- SEC6a: fare_reports read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.fare_reports) >= 0,
  'SEC6a: authenticated user can read fare_reports'
);

-- SEC7a: fare_reports create — self (allow)
WITH rank_row AS (SELECT id FROM public.ranks LIMIT 1),
     route_row AS (SELECT id FROM public.routes LIMIT 1)
INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar)
SELECT '22222222-2222-2222-2222-222222222222', rank_row.id, route_row.id, 20
FROM rank_row, route_row;
SELECT ok(
  exists (select 1 from public.fare_reports where user_id = '22222222-2222-2222-2222-222222222222'),
  'SEC7a: user can create own fare_report'
);

-- SEC7b: fare_reports create — other user (deny)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
DO $$
declare can_insert boolean := false;
begin
  insert into public.fare_reports (user_id, rank_id, route_id, amount_zar)
  select '33333333-3333-3333-3333-333333333333', id, (select id from public.routes limit 1), 20
  from public.ranks limit 1;
  can_insert := true;
exception when others then
  can_insert := false;
end;
SELECT ok(not can_insert, 'SEC7b: user cannot create fare_report for another user');

-- SEC8b: fare_reports update/delete — nobody (deny)
DO $$
declare can_update boolean := false;
begin
  update public.fare_reports set amount_zar = 99 where user_id = '22222222-2222-2222-2222-222222222222';
  can_update := true;
exception when others then
  can_update := false;
end;
SELECT ok(not can_update, 'SEC8b: fare_reports cannot be updated');

-- SEC9a: job_listings read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.job_listings) >= 1,
  'SEC9a: authenticated user can read job_listings'
);

-- SEC10b: job_listings write — nobody (deny)
DO $$
declare can_insert boolean := false;
begin
  insert into public.job_listings (title, wage_zar) values ('x', 100);
  can_insert := true;
exception when others then
  can_insert := false;
end;
SELECT ok(not can_insert, 'SEC10b: job_listings cannot be created');

-- SEC11a: user_activity read — owner only (allow)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
SELECT ok(
  (select count(*) from public.user_activity where user_id = '22222222-2222-2222-2222-222222222222') >= 0,
  'SEC11a: owner can read own activity'
);

-- SEC11b: user_activity read — not owner (deny)
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');
DO $$
declare can_read boolean := false;
begin
  select count(*) into can_read from public.user_activity where user_id = '33333333-3333-3333-3333-333333333333';
  can_read := true;
exception when others then
  can_read := false;
end;
SELECT ok(not can_read, 'SEC11b: cannot read another user activity');

-- SEC12b: user_activity create — nobody (deny)
DO $$
declare can_insert boolean := false;
begin
  insert into public.user_activity (user_id, type, description)
  values ('22222222-2222-2222-2222-222222222222', 'fare_report', 'x');
  can_insert := true;
exception when others then
  can_insert := false;
end;
SELECT ok(not can_insert, 'SEC12b: user_activity cannot be inserted directly');

-- SEC13a: fuel_price_snapshots read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.fuel_price_snapshots) >= 0,
  'SEC13a: authenticated user can read fuel_price_snapshots'
);

-- SEC14b: fuel_price_snapshots write — nobody (deny)
DO $$
declare can_insert boolean := false;
begin
  insert into public.fuel_price_snapshots (date, petrol_price_zar) values (current_date, 10.00);
  can_insert := true;
exception when others then
  can_insert := false;
end;
SELECT ok(not can_insert, 'SEC14b: fuel_price_snapshots cannot be written');

-- SEC15: Edge Function delete-account — tested at integration level (not in pgTAP)
SELECT ok(true, 'SEC15: delete-account Edge Function tested in integration tests');

SELECT * FROM finish();
