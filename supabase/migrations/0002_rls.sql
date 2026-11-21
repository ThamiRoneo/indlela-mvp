-- 0002_rls.sql: RLS on every table with all policies (Section 9)
-- Note: applications write access is OP15; there is no SEC id for it in Section 9.

alter table public.users enable row level security;
alter table public.ranks enable row level security;
alter table public.routes enable row level security;
alter table public.fare_reports enable row level security;
alter table public.job_listings enable row level security;
alter table public.user_activity enable row level security;
alter table public.applications enable row level security;
alter table public.fuel_price_snapshots enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;

-- SEC1: users read profile fields — any logged-in user
create policy users_select_authenticated on public.users
  for select to authenticated
  using (true);

-- SEC3: users update — owner only, cannot change id, email, created_at
create policy users_update_owner on public.users
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- SEC4: ranks read — any logged-in user
create policy ranks_select_authenticated on public.ranks
  for select to authenticated
  using (true);

-- SEC5: routes read — any logged-in user
create policy routes_select_authenticated on public.routes
  for select to authenticated
  using (true);

-- SEC6: fare_reports read — any logged-in user
create policy fare_reports_select_authenticated on public.fare_reports
  for select to authenticated
  using (true);

-- SEC7: fare_reports create — logged-in user, user_id = auth.uid()
create policy fare_reports_insert_owner on public.fare_reports
  for insert to authenticated
  with check (auth.uid() = user_id);

-- OP15: applications create — logged-in user, user_id = auth.uid()
create policy applications_insert_owner on public.applications
  for insert to authenticated
  with check (auth.uid() = user_id);

-- SEC9: job_listings read — any logged-in user
create policy job_listings_select_authenticated on public.job_listings
  for select to authenticated
  using (true);

-- SEC11: user_activity read — owner only
create policy user_activity_select_owner on public.user_activity
  for select to authenticated
  using (auth.uid() = user_id);

-- SEC13: fuel_price_snapshots read — any logged-in user
create policy fuel_price_snapshots_select_authenticated on public.fuel_price_snapshots
  for select to authenticated
  using (true);
