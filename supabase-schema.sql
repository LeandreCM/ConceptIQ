-- ConceptIQ Supabase schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'conceptiq-user',
  display_name text,
  conceptiq_score integer not null default 0 check (conceptiq_score between 0 and 1000),
  ability_score integer not null default 0 check (ability_score between 0 and 1000),
  growth_score integer not null default 0 check (growth_score between 0 and 1000),
  consistency_score integer not null default 0 check (consistency_score between 0 and 1000),
  reaction_score integer not null default 0 check (reaction_score between 0 and 1000),
  memory_score integer not null default 0 check (memory_score between 0 and 1000),
  pattern_score integer not null default 0 check (pattern_score between 0 and 1000),
  domain_scores jsonb not null default '{}'::jsonb,
  games_played integer not null default 0 check (games_played >= 0),
  best_reaction_time integer,
  average_reaction_time integer,
  best_memory_score integer not null default 0 check (best_memory_score between 0 and 1000),
  best_pattern_score integer not null default 0 check (best_pattern_score between 0 and 1000),
  max_games_in_session integer not null default 0 check (max_games_in_session >= 0),
  fail_counts jsonb not null default '{"reaction":0,"memory":0,"pattern":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_type text not null check (game_type in ('reaction', 'memory', 'pattern')),
  raw_score integer not null,
  normalized_score integer not null check (normalized_score between 0 and 1000),
  mistakes integer not null default 0 check (mistakes >= 0),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  score_before integer not null default 0 check (score_before between 0 and 1000),
  score_after integer not null default 0 check (score_after between 0 and 1000),
  score_change integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  category text not null,
  target integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_username text := coalesce(nullif(split_part(new.email, '@', 1), ''), 'conceptiq-user');
  next_username text := coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), fallback_username);
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    next_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), next_username)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create index if not exists profiles_conceptiq_score_idx on public.profiles (conceptiq_score desc);
create index if not exists profiles_average_reaction_time_idx on public.profiles (average_reaction_time asc);
create index if not exists attempts_user_created_at_idx on public.attempts (user_id, created_at desc);
create index if not exists attempts_user_game_type_idx on public.attempts (user_id, game_type);

alter table public.profiles add column if not exists domain_scores jsonb not null default '{}'::jsonb;

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
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "profiles are public leaderboard rows" on public.profiles;
create policy "profiles are public leaderboard rows"
on public.profiles for select
using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users read own attempts" on public.attempts;
create policy "users read own attempts"
on public.attempts for select
using (auth.uid() = user_id);

drop policy if exists "users insert own attempts" on public.attempts;
create policy "users insert own attempts"
on public.attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "users delete own attempts" on public.attempts;
create policy "users delete own attempts"
on public.attempts for delete
using (auth.uid() = user_id);

drop policy if exists "achievements are readable" on public.achievements;
create policy "achievements are readable"
on public.achievements for select
using (true);

drop policy if exists "users read own achievement unlocks" on public.user_achievements;
create policy "users read own achievement unlocks"
on public.user_achievements for select
using (auth.uid() = user_id);

drop policy if exists "users insert own achievement unlocks" on public.user_achievements;
create policy "users insert own achievement unlocks"
on public.user_achievements for insert
with check (auth.uid() = user_id);

drop policy if exists "users delete own achievement unlocks" on public.user_achievements;
create policy "users delete own achievement unlocks"
on public.user_achievements for delete
using (auth.uid() = user_id);

insert into public.achievements (id, name, description, category, target)
values
  ('big-brain', 'Big Brain', 'Reach 500 ConceptIQ Score.', 'score', 500),
  ('galaxy-brain', 'Galaxy Brain', 'Reach 900 ConceptIQ Score.', 'score', 900),
  ('lightning-thinker', 'Lightning Thinker', 'Record a reaction time under 250ms.', 'speed', 250),
  ('human-calculator', 'Human Calculator', 'Reach 500 in Quantitative Reasoning. Perfect reverse recall counts during the MVP.', 'domain', 500),
  ('pattern-hunter', 'Pattern Hunter', 'Answer 8 or more pattern questions correctly.', 'pattern', 8),
  ('comeback-arc', 'Comeback Arc', 'Improve your ConceptIQ Score by 50 or more in one result.', 'growth', 50),
  ('consistency-beast', 'Consistency Beast', 'Complete 10 sessions within 30 days.', 'consistency', 10),
  ('brain-melt', 'Brain Melt', 'Miss the same type of challenge 5 times.', 'grit', 5),
  ('one-more-rep', 'One More Rep', 'Play 3 games in one browser session.', 'consistency', 3),
  ('the-outlier', 'The Outlier', 'Reach the top 1% placeholder rank.', 'score', 980),
  ('memory-keeper', 'Memory Keeper', 'Reach 500 in the Memory domain.', 'domain', 500),
  ('process-master', 'Process Master', 'Complete a future process-memory challenge at high accuracy.', 'domain', 1),
  ('working-memory-beast', 'Working Memory Beast', 'Reach 500 in the Working Memory domain.', 'domain', 500),
  ('spatial-wizard', 'Spatial Wizard', 'Reach 500 in the Spatial Reasoning domain.', 'domain', 500),
  ('logic-lord', 'Logic Lord', 'Reach 500 in the Logic domain.', 'domain', 500),
  ('focus-monk', 'Focus Monk', 'Reach 500 in the Focus / Attention domain.', 'domain', 500),
  ('verbal-analyst', 'Verbal Analyst', 'Reach 500 in the Verbal Reasoning domain.', 'domain', 500),
  ('system-architect', 'System Architect', 'Reach 500 in the Systems Thinking domain.', 'domain', 500)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  target = excluded.target;
