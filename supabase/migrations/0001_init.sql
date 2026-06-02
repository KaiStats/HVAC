-- Compliance Copilot — canonical schema (Phase 1 tables)
-- Multi-tenant from line one: every org-scoped row carries org_id and RLS is
-- enforced. Phase 2/3/5 tables (scenarios, training, versions) are added in
-- their own migrations when those phases are built ("ship the wedge first").

create extension if not exists "vector" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Organizations --------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vertical text, -- e.g. 'construction', 'healthcare', 'restaurant'
  created_at timestamptz default now()
);

-- Profiles: mirrors auth.users, one row per person -------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid references public.organizations (id) on delete cascade,
  full_name text,
  role text not null default 'worker', -- 'admin' | 'manager' | 'worker'
  job_title text, -- drives role-specific training (Phase 3)
  created_at timestamptz default now()
);
create index if not exists profiles_org_id_idx on public.profiles (org_id);

-- Documents ------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  file_path text, -- Supabase Storage path
  file_type text, -- pdf | docx | txt
  status text not null default 'processing', -- processing | ready | error
  version int not null default 1, -- versioned KB (Phase 5)
  uploaded_by uuid references public.profiles (id),
  -- Operational columns (additive) powering Phase 1 UX:
  page_count int,
  error text,
  created_at timestamptz default now()
);
create index if not exists documents_org_id_idx on public.documents (org_id);

-- Document chunks ------------------------------------------------------------
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  content text not null,
  section_title text,
  page_number int,
  chunk_index int,
  embedding extensions.vector(1024), -- MATCH this to your Voyage model's dims
  created_at timestamptz default now()
);
create index if not exists document_chunks_org_id_idx
  on public.document_chunks (org_id);
create index if not exists document_chunks_document_id_idx
  on public.document_chunks (document_id);
create index if not exists document_chunks_embedding_idx
  on public.document_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

-- Conversations + messages (cited Q&A, audit evidence) -----------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id),
  title text,
  created_at timestamptz default now()
);
create index if not exists conversations_org_id_idx
  on public.conversations (org_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null, -- 'user' | 'assistant'
  content text not null,
  citations jsonb, -- [{ref, document_id, document_title, section, page, snippet}]
  created_at timestamptz default now()
);
create index if not exists messages_conversation_id_idx
  on public.messages (conversation_id);

-- Helper: the caller's org_id ------------------------------------------------
-- Implements the standard policy pattern
--   org_id = (select org_id from profiles where id = auth.uid())
-- as a SECURITY DEFINER function so the profiles policy can't recurse.
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- New-user bootstrap: give every new auth user their own org + admin profile.
-- Each signup is its own tenant, which makes isolation easy to demo/verify.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
begin
  org_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'org_name', ''),
    split_part(coalesce(new.email, 'My'), '@', 1) || '''s workspace'
  );

  insert into public.organizations (name) values (org_name)
    returning id into new_org_id;

  insert into public.profiles (id, org_id, full_name, role)
  values (
    new.id,
    new_org_id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'admin'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-Level Security ---------------------------------------------------------
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

-- Retrieval function ---------------------------------------------------------
-- SECURITY INVOKER (default): RLS on document_chunks still applies, so callers
-- can only ever match chunks from their own org.
create or replace function public.match_chunks(
  query_embedding extensions.vector(1024),
  match_count int default 8
)
returns table (
  id uuid,
  document_id uuid,
  document_title text,
  content text,
  section text,
  page int,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    d.title as document_title,
    c.content,
    c.section_title as section,
    c.page_number as page,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where d.status = 'ready'
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
