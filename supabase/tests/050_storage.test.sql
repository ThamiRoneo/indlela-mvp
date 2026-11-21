-- 050_storage.test.sql: SEC16-SEC18 — storage buckets and object permissions (Section 8.6)
begin;
select plan(13);

-- SEC16 / §8.6: bucket definitions.
select ok(
  (select count(*) = 1 from storage.buckets where id = 'avatars'),
  'SEC16a: avatars bucket exists'
);
select is(
  (select public from storage.buckets where id = 'avatars'),
  false,
  'SEC16a: avatars bucket is private (signed URLs)'
);
select is(
  (select file_size_limit from storage.buckets where id = 'avatars'),
  204800::bigint,
  'SEC16a: avatars bucket allows at most 200KB'
);
select is(
  (select allowed_mime_types from storage.buckets where id = 'avatars'),
  array['image/jpeg']::text[],
  'SEC16a: avatars bucket accepts JPEG only'
);

select ok(
  (select count(*) = 1 from storage.buckets where id = 'posts'),
  'SEC16b: posts bucket exists'
);
select is(
  (select public from storage.buckets where id = 'posts'),
  false,
  'SEC16b: posts bucket is private (signed URLs)'
);
select is(
  (select file_size_limit from storage.buckets where id = 'posts'),
  1048576::bigint,
  'SEC16b: posts bucket allows at most 1MB'
);
select is(
  (select allowed_mime_types from storage.buckets where id = 'posts'),
  array['image/jpeg']::text[],
  'SEC16b: posts bucket accepts JPEG only'
);

-- Fixture: a service-role upload under the {user_id}/ prefix.
set role service_role;
insert into storage.objects (bucket_id, name, owner, metadata)
values (
  'avatars',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/avatar.jpg',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '{"mimetype":"image/jpeg"}'::jsonb
);
reset role;

-- SEC16: authenticated users can read objects; anon cannot.
set role authenticated;
select is(
  (select count(*)::int from storage.objects
   where bucket_id = 'avatars' and name like 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/%'),
  1,
  'SEC16c: authenticated user can read avatars objects'
);
reset role;
set role anon;
select is(
  (select count(*)::int from storage.objects
   where bucket_id = 'avatars' and name like 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/%'),
  0,
  'SEC16d: logged-out user cannot read avatars objects'
);
reset role;

-- SEC17: app writes are denied; scripts (service role) may write.
set role authenticated;
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('posts', 'seed.jpg', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"mimetype":"image/jpeg"}'::jsonb)$$,
  '42501',
  null::text,
  'SEC17a: authenticated user cannot upload objects'
);
reset role;
set role service_role;
select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('posts', 'seed.jpg', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"mimetype":"image/jpeg"}'::jsonb)$$,
  'SEC17b: service role (scripts) can upload objects'
);

-- SEC18: account deletion removes objects under the caller's own prefix.
-- Direct SQL deletes are guarded by storage.protect_delete(); the Storage API sets
-- storage.allow_delete_query before deleting. Mirror that inside this rolled-back
-- transaction so the RLS/service-role delete path is what gets exercised.
set storage.allow_delete_query = 'true';
delete from storage.objects
where bucket_id = 'avatars'
  and name like 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/%';
select is(
  (select count(*)::int from storage.objects
   where bucket_id = 'avatars' and name like 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/%'),
  0,
  'SEC18: service role deletes avatar objects under the user prefix'
);
reset storage.allow_delete_query;
reset role;

select * from finish();
rollback;
