-- Compliance Copilot — canonical schema (Phase 1 tables).
-- Run this first, then db/policies.sql. Multi-tenant from line one: every
-- org-scoped row carries org_id. Phase 2/3/5 tables are added when built.

create extension if not exists "vector" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Organizations --------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vertical text, -- e.g. 'construction', 'healthcare', 'restaurant'
  created_at timestamptz default now()
);

-- Profiles: mirrors auth.users, one row per person --------------------------
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
  -- Additive operational columns powering Phase 1 UX:
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
-- Implements org_id = (select org_id from profiles where id = auth.uid()) as a
-- SECURITY DEFINER function so the profiles policy can't recurse.
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

-- Private storage bucket for uploaded manuals.
-- Object paths are "<org_id>/<document_id>.<ext>" so RLS can scope by folder.
insert into storage.buckets (id, name, public)
values ('manuals', 'manuals', false)
on conflict (id) do nothing;
