-- 0004_seed.sql: seed data (Section 8.7)

-- Seed ranks
insert into public.ranks (name, city, province) values
  ('Rustenburg Taxi Rank', 'Rustenburg', 'North West'),
  ('Boitekong Taxi Rank', 'Rustenburg', 'North West'),
  ('Tlhabane Taxi Rank', 'Rustenburg', 'North West'),
  ('Phokeng Taxi Rank', 'Rustenburg', 'North West'),
  ('Geelhout Park Rank', 'Rustenburg', 'North West')
on conflict (name) do nothing;

-- Seed routes (fare amounts are illustrative; live fares come from fare_reports)
with r as (select id, name from public.ranks)
insert into public.routes (rank_id, destination)
select r.id, 'Johannesburg Park Station' from r where r.name = 'Rustenburg Taxi Rank'
union all
select r.id, 'Pretoria CBD' from r where r.name = 'Rustenburg Taxi Rank'
union all
select r.id, 'Brits' from r where r.name = 'Rustenburg Taxi Rank'
union all
select r.id, 'Sun City' from r where r.name = 'Rustenburg Taxi Rank'
on conflict do nothing;

-- Seed job listings
with r as (select id, name from public.ranks),
     rt as (select id, destination from public.routes)
insert into public.job_listings (title, company, wage_zar, location, description, source_url, rank_id, route_id)
select
  'Retail Assistant', 'Shoprite', 150, 'Rustenburg CBD', 'Entry-level retail position.', null,
  (select id from r where name = 'Rustenburg Taxi Rank'),
  (select id from rt where destination = 'Johannesburg Park Station')
union all
select
  'Call Centre Agent', 'Teleperformance', 250, 'Rustenburg', 'Customer support role.', null,
  (select id from r where name = 'Rustenburg Taxi Rank'),
  (select id from rt where destination = 'Pretoria CBD')
union all
select
  'Warehouse Packer', 'Logistics Co.', 180, 'Brits', 'Warehouse packing role.', null,
  (select id from r where name = 'Boitekong Taxi Rank'),
  (select id from rt where destination = 'Brits')
union all
select
  'Security Guard', 'Securitas', 220, 'Sun City', 'Security position.', null,
  (select id from r where name = 'Phokeng Taxi Rank'),
  (select id from rt where destination = 'Sun City')
on conflict do nothing;

-- Seed fuel price snapshot for BR7 testing
insert into public.fuel_price_snapshots (date, petrol_price_zar, source)
values (current_date, 25.00, 'AA')
on conflict do nothing;
