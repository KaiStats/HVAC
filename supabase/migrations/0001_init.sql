-- Compliance Copilot — Phase 1 schema
-- Multi-tenant from line one: every row carries org_id and RLS is enforced.

-- Extensions -----------------------------------------------------------------
create extension if not exists "vector" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Tables ---------------------------------------------------------------------
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'member',
  created_at timestamptz not null default now()
);
create index if not exists profiles_org_id_idx on public.profiles (org_id);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  title text not null,
  storage_path text not null,
  status text not null default 'processing'
    check (status in ('processing', 'ready', 'error')),
  page_count int,
  error text,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists documents_org_id_idx on public.documents (org_id);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  content text not null,
  section text,
  page int,
  chunk_index int not null,
  embedding extensions.vector(1024),
  created_at timestamptz not null default now()
);
create index if not exists document_chunks_org_id_idx on public.document_chunks (org_id);
create index if not exists document_chunks_document_id_idx on public.document_chunks (document_id);
-- Approximate nearest-neighbour index for retrieval (cosine distance).
create index if not exists document_chunks_embedding_idx
  on public.document_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

-- Helper: the caller's org_id ------------------------------------------------
-- SECURITY DEFINER so it can read profiles without tripping profiles' own RLS.
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- New-user bootstrap: give every new auth user their own org + profile -------
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

  insert into public.orgs (name) values (org_name) returning id into new_org_id;

  insert into public.profiles (id, org_id, email, full_name, role)
  values (
    new.id,
    new_org_id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'owner'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-Level Security ---------------------------------------------------------
alter table public.orgs enable row level security;
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

-- orgs: a user can see only their own org.
drop policy if exists orgs_select on public.orgs;
create policy orgs_select on public.orgs
  for select using (id = public.current_org_id());

-- profiles: a user can read profiles in their org, and update their own row.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (org_id = public.current_org_id());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- documents: full CRUD scoped to the caller's org.
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

-- document_chunks: read scoped to org. Writes happen via the service role
-- (ingestion), which bypasses RLS but always sets org_id explicitly.
drop policy if exists document_chunks_select on public.document_chunks;
create policy document_chunks_select on public.document_chunks
  for select using (org_id = public.current_org_id());

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
    c.section,
    c.page,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where d.status = 'ready'
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
