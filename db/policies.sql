-- Row-Level Security — run after db/schema.sql.
-- Enable RLS on every table; scope everything to the caller's org.

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- organizations
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
  for select using (id = public.current_org_id());

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (org_id = public.current_org_id());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- documents (full CRUD scoped to the caller's org)
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
  for select using (org_id = public.current_org_id());

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents
  for insert with check (org_id = public.current_org_id());

drop policy if exists documents_update on public.documents;
create policy documents_update on public.documents
  for update using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents
  for delete using (org_id = public.current_org_id());

-- document_chunks (read scoped to org; writes via service role on ingest)
drop policy if exists document_chunks_select on public.document_chunks;
create policy document_chunks_select on public.document_chunks
  for select using (org_id = public.current_org_id());

-- conversations
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select using (org_id = public.current_org_id());

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert with check (org_id = public.current_org_id());

-- messages (scoped through their conversation's org)
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.org_id = public.current_org_id()
    )
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.org_id = public.current_org_id()
    )
  );

-- Storage: objects live under "<org_id>/..." so we scope by the first folder.
drop policy if exists "documents read own org" on storage.objects;
create policy "documents read own org" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

drop policy if exists "documents insert own org" on storage.objects;
create policy "documents insert own org" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

drop policy if exists "documents delete own org" on storage.objects;
create policy "documents delete own org" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );
