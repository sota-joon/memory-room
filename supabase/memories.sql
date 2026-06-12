create extension if not exists "pgcrypto";

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  recipient text,
  message_text text not null default '',
  selected_questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  audio_url text,
  created_at timestamptz not null default now(),
  email text not null,
  access_token text not null unique
);

create index if not exists memories_access_token_idx
  on public.memories (access_token);

alter table public.memories enable row level security;

drop policy if exists "memories_no_public_read" on public.memories;
drop policy if exists "memories_no_public_insert" on public.memories;

create policy "memories_no_public_read"
  on public.memories
  for select
  using (false);

create policy "memories_no_public_insert"
  on public.memories
  for insert
  with check (false);
