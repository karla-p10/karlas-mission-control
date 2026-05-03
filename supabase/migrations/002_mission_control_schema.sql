-- Mission Control: Full Schema
-- Paste this entire block into Supabase SQL Editor → Run

-- ============================================
-- PROFILES
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- CATEGORIES (Projects + Sub-projects)
-- parent_id = null → top-level project
-- parent_id = uuid  → sub-project under that project
-- ============================================
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  parent_id uuid references public.categories(id) on delete cascade,
  name text not null,
  emoji text default '📁' not null,
  color text default 'purple' not null,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_categories_parent on public.categories(parent_id);

-- ============================================
-- TASKS
-- ============================================
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'inbox' not null check (status in ('inbox', 'in-progress', 'waiting', 'done')),
  priority text default 'medium' not null check (priority in ('low', 'medium', 'high')),
  due_date date,
  assignee text default 'karla',
  created_at timestamptz default now() not null,
  completed_at timestamptz,
  source text default 'manual'  -- 'manual' | 'slack' | 'notion'
);

create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_tasks_status on public.tasks(user_id, status);
create index if not exists idx_tasks_category on public.tasks(category_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories
drop policy if exists "Users can view own categories" on public.categories;
drop policy if exists "Users can create own categories" on public.categories;
drop policy if exists "Users can update own categories" on public.categories;
drop policy if exists "Users can delete own categories" on public.categories;
create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can create own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

-- Tasks
drop policy if exists "Users can view own tasks" on public.tasks;
drop policy if exists "Users can create own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can create own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);
