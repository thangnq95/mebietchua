-- Supabase schema for mebietchua.com WHO tool
-- Run this in Supabase SQL editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dob date not null,
  gender text not null check (gender in ('boy', 'girl')),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists children_user_id_idx on public.children (user_id);
create index if not exists children_user_active_idx on public.children (user_id, active desc, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_children_updated_at on public.children;
create trigger set_children_updated_at
before update on public.children
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        email = excluded.email,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.children enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
using (auth.uid() = user_id);

drop policy if exists "children_select_own" on public.children;
create policy "children_select_own"
on public.children for select
using (auth.uid() = user_id);

drop policy if exists "children_insert_own" on public.children;
create policy "children_insert_own"
on public.children for insert
with check (auth.uid() = user_id);

drop policy if exists "children_update_own" on public.children;
create policy "children_update_own"
on public.children for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "children_delete_own" on public.children;
create policy "children_delete_own"
on public.children for delete
using (auth.uid() = user_id);
