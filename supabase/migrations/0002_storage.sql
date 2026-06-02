-- Private storage bucket for uploaded documents.
-- Object paths are "<org_id>/<document_id>.pdf" so RLS can scope by folder.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Read: only objects under the caller's own org folder.
drop policy if exists "documents read own org" on storage.objects;
create policy "documents read own org" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

-- Insert: only into the caller's own org folder.
drop policy if exists "documents insert own org" on storage.objects;
create policy "documents insert own org" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

-- Delete: only the caller's own org folder.
drop policy if exists "documents delete own org" on storage.objects;
create policy "documents delete own org" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );
