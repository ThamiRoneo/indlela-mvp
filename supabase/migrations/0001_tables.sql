-- 0001_tables.sql: all tables, constraints and indexes (Section 8.1-8.4)

-- Table: ranks
create table public.ranks (
  id uuid not null default gen_random_uuid(),
  name text not null,
  city text not null default 'Rustenburg',
  province text not null default 'North West',
  fuel_alert_active boolean not null default false,
  constraint ranks_pkey primary key (id),
  constraint ranks_name_unique unique (name)
);

-- Table: users
create table public.users (
  id uuid not null default gen_random_uuid(),
  email text not null,
  username text,
  nearest_rank_id uuid,
  weekly_transport_budget integer,
  created_at timestamptz not null default now(),
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint users_nearest_rank_id_fkey foreign key (nearest_rank_id) references public.ranks (id) on delete set null,
  constraint users_email_unique unique (email),
  constraint users_email_lower check (email = lower(email)),
  constraint users_username_check check (
    username is null or (
      username ~ '^[a-z0-9._]{3,30}$'
      and username !~ '^\.'
      and username !~ '\.$'
    )
  ),
  constraint users_weekly_transport_budget_check check (weekly_transport_budget is null or weekly_transport_budget >= 0)
);

-- Table: routes
create table public.routes (
  id uuid not null default gen_random_uuid(),
  rank_id uuid not null,
  destination text not null,
  constraint routes_pkey primary key (id),
  constraint routes_rank_id_fkey foreign key (rank_id) references public.ranks (id) on delete cascade,
  constraint routes_destination_length check (length(destination) >= 1 and length(destination) <= 100)
);

-- Table: fare_reports
create table public.fare_reports (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  rank_id uuid not null,
  route_id uuid not null,
  amount_zar integer not null,
  created_at timestamptz not null default now(),
  constraint fare_reports_pkey primary key (id),
  constraint fare_reports_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint fare_reports_rank_id_fkey foreign key (rank_id) references public.ranks (id) on delete cascade,
  constraint fare_reports_route_id_fkey foreign key (route_id) references public.routes (id) on delete cascade,
  constraint fare_reports_amount_zar_check check (amount_zar > 0 and amount_zar < 200)
);

-- Table: job_listings
create table public.job_listings (
  id uuid not null default gen_random_uuid(),
  title text not null,
  company text,
  wage_zar integer,
  location text,
  description text,
  source_url text,
  rank_id uuid,
  route_id uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint job_listings_pkey primary key (id),
  constraint job_listings_rank_id_fkey foreign key (rank_id) references public.ranks (id) on delete set null,
  constraint job_listings_route_id_fkey foreign key (route_id) references public.routes (id) on delete set null,
  constraint job_listings_title_length check (length(title) >= 1 and length(title) <= 200),
  constraint job_listings_company_length check (company is null or (length(company) >= 1 and length(company) <= 100)),
  constraint job_listings_wage_zar_check check (wage_zar is null or wage_zar >= 0),
  constraint job_listings_location_length check (location is null or length(location) <= 200),
  constraint job_listings_description_length check (description is null or length(description) <= 2000)
);

-- Table: user_activity
create table public.user_activity (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  description text not null,
  created_at timestamptz not null default now(),
  constraint user_activity_pkey primary key (id),
  constraint user_activity_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint user_activity_type_check check (type in ('fare_report','alert_received','comment_received','follow','unlike')),
  constraint user_activity_description_length check (length(description) <= 200)
);

-- Table: applications
create table public.applications (
  id uuid not null default gen_random_uuid(),
  job_listing_id uuid not null,
  user_id uuid not null default auth.uid(),
  name text not null,
  phone text not null,
  email text not null,
  created_at timestamptz not null default now(),
  constraint applications_pkey primary key (id),
  constraint applications_job_listing_id_fkey foreign key (job_listing_id) references public.job_listings (id) on delete cascade,
  constraint applications_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint applications_name_length check (length(name) >= 1 and length(name) <= 100),
  constraint applications_phone_length check (length(phone) >= 1 and length(phone) <= 20),
  constraint applications_email_check check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table: fuel_price_snapshots
create table public.fuel_price_snapshots (
  id uuid not null default gen_random_uuid(),
  date date not null,
  petrol_price_zar numeric(10,2) not null,
  source text not null default 'AA',
  constraint fuel_price_snapshots_pkey primary key (id),
  constraint fuel_price_snapshots_petrol_price_zar_check check (petrol_price_zar >= 0)
);

-- Table: comments
create table public.comments (
  id uuid not null default gen_random_uuid(),
  fare_report_id uuid not null,
  user_id uuid not null default auth.uid(),
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_pkey primary key (id),
  constraint comments_fare_report_id_fkey foreign key (fare_report_id) references public.fare_reports (id) on delete cascade,
  constraint comments_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint comments_body_length check (length(body) >= 1 and length(body) <= 300)
);

-- Table: follows
create table public.follows (
  id uuid not null default gen_random_uuid(),
  follower_id uuid not null,
  following_id uuid not null,
  created_at timestamptz not null default now(),
  constraint follows_pkey primary key (id),
  constraint follows_follower_id_fkey foreign key (follower_id) references public.users (id) on delete cascade,
  constraint follows_following_id_fkey foreign key (following_id) references public.users (id) on delete cascade
);

-- Table: likes
create table public.likes (
  id uuid not null default gen_random_uuid(),
  fare_report_id uuid not null,
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint likes_pkey primary key (id),
  constraint likes_fare_report_id_fkey foreign key (fare_report_id) references public.fare_reports (id) on delete cascade,
  constraint likes_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade
);

-- Indexes (Section 8.4)
create index idx_fare_reports_rank_route_created on public.fare_reports (rank_id, route_id, created_at desc);
create index idx_fare_reports_user_created on public.fare_reports (user_id, created_at desc);
create index idx_job_listings_created on public.job_listings (created_at desc);
create index idx_user_activity_user_created on public.user_activity (user_id, created_at desc);
create index idx_routes_rank_id on public.routes (rank_id);
create index idx_ranks_name on public.ranks (name);

-- Column privileges for SEC2: email never readable through the table
revoke select on public.users from anon, authenticated;
grant select (id, username, nearest_rank_id, weekly_transport_budget, created_at) on public.users to authenticated;
