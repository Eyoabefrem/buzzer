-- Buzzer Phase 2 and 3. Run in Supabase: SQL Editor > New query > paste > Run.
-- Party rooms need no tables: they use Supabase Realtime.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 16),
  mascot text not null default 'zap' check (mascot in ('zap', 'bloop', 'pip', 'rex')),
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "names are public" on profiles for select using (true);
create policy "create own profile" on profiles for insert with check (id = auth.uid());
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid());

create table scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  mode text not null check (mode in ('solo', 'daily')),
  day date not null default ((now() at time zone 'utc')::date),
  score int not null check (score >= 0),
  correct int not null,
  total int not null,
  best_streak int not null default 0,
  category text,
  created_at timestamptz not null default now(),
  -- A score must be possible: at most 1200 points per correct answer (hard question, instant, x2 streak).
  constraint plausible check (total between 1 and 20 and correct between 0 and total and best_streak between 0 and correct and score <= correct * 1200)
);
create unique index one_daily_per_day on scores (user_id, day) where mode = 'daily';
alter table scores enable row level security;
create policy "scores are public" on scores for select using (true);
create policy "add own scores" on scores for insert with check (user_id = auth.uid());
-- Players choose only the game result. The day and the owner are filled in by the database. Scores can never be edited or deleted.
revoke insert, update on scores from anon, authenticated;
grant insert (mode, score, correct, total, best_streak, category) on scores to authenticated;

create view leaderboard_alltime as
  select s.user_id, coalesce(p.name, 'Player') as name, coalesce(p.mascot, 'zap') as mascot, max(s.score) as best
  from scores s left join profiles p on p.id = s.user_id
  where s.mode = 'solo' group by s.user_id, p.name, p.mascot order by best desc, name;
create view leaderboard_daily as
  select s.user_id, coalesce(p.name, 'Player') as name, coalesce(p.mascot, 'zap') as mascot, s.score as best
  from scores s left join profiles p on p.id = s.user_id
  where s.mode = 'daily' and s.day = (now() at time zone 'utc')::date order by s.score desc, name;
grant select on leaderboard_alltime, leaderboard_daily to anon, authenticated;
