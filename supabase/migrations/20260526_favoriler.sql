-- Favoriler tablosu
create table if not exists public.favoriler (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  madde_id bigint not null references public.maddeler(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, madde_id)
);

create index if not exists favoriler_user_idx on public.favoriler(user_id);
create index if not exists favoriler_madde_idx on public.favoriler(madde_id);

alter table public.favoriler enable row level security;

drop policy if exists "favoriler_select_own" on public.favoriler;
create policy "favoriler_select_own"
  on public.favoriler for select
  using (auth.uid() = user_id);

drop policy if exists "favoriler_insert_own" on public.favoriler;
create policy "favoriler_insert_own"
  on public.favoriler for insert
  with check (auth.uid() = user_id);

drop policy if exists "favoriler_delete_own" on public.favoriler;
create policy "favoriler_delete_own"
  on public.favoriler for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.favoriler to authenticated;
