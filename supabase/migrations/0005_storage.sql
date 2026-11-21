-- 0005_storage.sql: storage buckets and policies SEC16-SEC18 (Section 8.6)
--
-- Section 6 describes the buckets as read by the app via signed URLs and written
-- only by scripts. Signed URLs are meaningful on private buckets, so public = false.
-- The service role bypasses RLS, which is how scripts and the delete-account
-- Edge Function write and remove objects.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 204800, array['image/jpeg']::text[]),
  ('posts',   'posts',   false, 1048576, array['image/jpeg']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- SEC16: any authenticated user may read objects from either bucket.
drop policy if exists "SEC16 avatars read" on storage.objects;
create policy "SEC16 avatars read" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars');

drop policy if exists "SEC16 posts read" on storage.objects;
create policy "SEC16 posts read" on storage.objects
  for select to authenticated
  using (bucket_id = 'posts');

-- SEC17: app writes are denied. There is deliberately no insert/update/delete
-- policy for anon or authenticated here; the service role (scripts) bypasses RLS.
--
-- SEC18: the delete-account Edge Function uses the service role to remove objects
-- under the caller's own prefix, {user_id}/avatar.jpg (see the Edge Function).
