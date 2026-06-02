-- Saved Q&A turns. Each row stores the question, the answer, and the citation
-- JSON it was grounded in — this becomes audit evidence later.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  question text not null,
  answer text not null,
  citations jsonb not null default '[]'::jsonb,
  refused boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_org_id_idx on public.messages (org_id);
create index if not exists messages_created_at_idx
  on public.messages (org_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (org_id = public.current_org_id());

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (org_id = public.current_org_id());
