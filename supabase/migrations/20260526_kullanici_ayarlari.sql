-- Kullanici ayarlari tablosu
create table if not exists public.kullanici_ayarlari (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tema text not null default 'light' check (tema in ('light','dark')),
  yazi_boyutu text not null default 'md' check (yazi_boyutu in ('sm','md','lg')),
  ayarlar jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kullanici_ayarlari enable row level security;

drop policy if exists "ayarlar_select_own" on public.kullanici_ayarlari;
create policy "ayarlar_select_own"
  on public.kullanici_ayarlari for select
  using (auth.uid() = user_id);

drop policy if exists "ayarlar_insert_own" on public.kullanici_ayarlari;
create policy "ayarlar_insert_own"
  on public.kullanici_ayarlari for insert
  with check (auth.uid() = user_id);

drop policy if exists "ayarlar_update_own" on public.kullanici_ayarlari;
create policy "ayarlar_update_own"
  on public.kullanici_ayarlari for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
