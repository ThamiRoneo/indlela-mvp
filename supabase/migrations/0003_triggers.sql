-- 0003_triggers.sql: triggers (Section 8.5)
-- Every function has set search_path = ''. Triggers are security definer.

-- BR3: limit_fare_reports — max 5 fare reports per user per day
create or replace function public.limit_fare_reports()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_count integer;
begin
  select count(*)
  into today_count
  from public.fare_reports
  where user_id = new.user_id
    and created_at >= date_trunc('day', now() at time zone 'UTC')
    and created_at <  (date_trunc('day', now() at time zone 'UTC') + interval '1 day');

  if today_count >= 5 then
    raise exception 'rate_limit_fare_reports';
  end if;

  return new;
end;
$$;

create trigger trg_limit_fare_reports
  before insert on public.fare_reports
  for each row
  execute function public.limit_fare_reports();

-- BR7: fuel_price_check — manual/scheduled; if fuel price up >= 5% in 30 days,
-- set fuel_alert_active = true on affected ranks and create alert_received activity
create or replace function public.fuel_price_check()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  latest_price numeric;
  avg_price numeric;
  pct_change numeric;
begin
  select petrol_price_zar
  into latest_price
  from public.fuel_price_snapshots
  order by date desc, id desc
  limit 1;

  if latest_price is null then
    return; -- fuel price data unavailable: fail silently
  end if;

  select avg(petrol_price_zar)
  into avg_price
  from public.fuel_price_snapshots
  where date >= (select max(date) from public.fuel_price_snapshots) - interval '30 days'
    and date < (select max(date) from public.fuel_price_snapshots);

  if avg_price is null or avg_price = 0 then
    return;
  end if;

  pct_change := ((latest_price - avg_price) / avg_price) * 100;

  if pct_change >= 5 then
    update public.ranks
    set fuel_alert_active = true;

    insert into public.user_activity (user_id, type, description)
    select u.id, 'alert_received', 'Fares may increase soon. Check updated fares for your rank.'
    from public.users u;
  end if;
end;
$$;

-- activity_on_fare_report: after insert on fare_reports
create or replace function public.activity_on_fare_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_activity (user_id, type, description)
  values (
    new.user_id,
    'fare_report',
    'Fare reported for a route from your nearest rank.'
  );
  return new;
end;
$$;

create trigger trg_activity_on_fare_report
  after insert on public.fare_reports
  for each row
  execute function public.activity_on_fare_report();

-- activity_on_comment: after insert on comments
create or replace function public.activity_on_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_activity (user_id, type, description)
  values (
    new.user_id,
    'comment_received',
    'Someone commented on your fare report.'
  );
  return new;
end;
$$;

create trigger trg_activity_on_comment
  after insert on public.comments
  for each row
  execute function public.activity_on_comment();

-- activity_on_follow: after insert on follows
create or replace function public.activity_on_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_activity (user_id, type, description)
  values (
    new.following_id,
    'follow',
    'Someone started following you.'
  );
  return new;
end;
$$;

create trigger trg_activity_on_follow
  after insert on public.follows
  for each row
  execute function public.activity_on_follow();

-- activity_on_unlike: after delete on likes
create or replace function public.activity_on_unlike()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  report_owner uuid;
begin
  select user_id into report_owner
  from public.fare_reports
  where id = old.fare_report_id;

  if report_owner is not null then
    insert into public.user_activity (user_id, type, description)
    values (
      report_owner,
      'unlike',
      'Someone removed their like on your fare report.'
    );
  end if;

  return old;
end;
$$;

create trigger trg_activity_on_unlike
  after delete on public.likes
  for each row
  execute function public.activity_on_unlike();
