-- THE 14 — Supabase Schema
-- Run this in the Supabase SQL editor to set up your database.

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── TABLES ───────────────────────────────────────────────────────────────────

create table games (
  id uuid primary key default gen_random_uuid(),
  game_code text not null unique,
  status text not null default 'waiting'
    check (status in ('waiting','briefing','active','revealing','finished')),
  current_round integer not null default 1,
  max_players integer not null default 14,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  name text not null,
  avatar text,
  is_game_master boolean not null default false,
  is_connected boolean not null default true,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  score integer not null default 0,
  status text not null default 'waiting'
);

create table rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  round_number integer not null,
  title text not null,
  description text not null,
  status text not null default 'pending'
    check (status in ('pending','briefing','active','locked','revealing','complete')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table player_roles (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  role_name text not null,
  secret_objective text not null,
  private_information text not null,
  special_ability text,
  created_at timestamptz not null default now(),
  unique (game_id, player_id)
);

create table round_assignments (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  assignment text not null,
  private_instruction text not null,
  target_player_id uuid references players(id),
  team text,
  created_at timestamptz not null default now(),
  unique (round_id, player_id)
);

create table actions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  action_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (round_id, player_id)
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  voter_id uuid not null references players(id) on delete cascade,
  target_id uuid not null references players(id) on delete cascade,
  choice text not null,
  created_at timestamptz not null default now(),
  unique (round_id, voter_id)
);

create table events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  round_id uuid references rounds(id) on delete set null,
  event_type text not null,
  actor_id uuid references players(id) on delete set null,
  target_id uuid references players(id) on delete set null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table scores (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  round_id uuid not null references rounds(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

create index on players(game_id);
create index on rounds(game_id);
create index on player_roles(player_id);
create index on player_roles(game_id);
create index on round_assignments(round_id);
create index on round_assignments(player_id);
create index on actions(round_id);
create index on actions(player_id);
create index on events(game_id);
create index on scores(game_id);
create index on scores(player_id);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────

-- Enable realtime on key tables (run in Supabase dashboard or here)
alter publication supabase_realtime add table games;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table rounds;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table actions;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

-- All security is enforced server-side via service role key.
-- The app never exposes player_roles of other players.
-- Enable RLS but keep anon access blocked; only service role bypasses RLS.

alter table games enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;
alter table player_roles enable row level security;
alter table round_assignments enable row level security;
alter table actions enable row level security;
alter table votes enable row level security;
alter table events enable row level security;
alter table scores enable row level security;

-- Allow anon to read non-sensitive tables (game lobby display, events)
create policy "games_read" on games for select using (true);
create policy "players_read" on players for select using (true);
create policy "rounds_read" on rounds for select using (true);
create policy "events_read" on events for select using (true);
create policy "scores_read" on scores for select using (true);
create policy "actions_read" on actions for select using (true);

-- player_roles: NO anon read. Service role only.
-- round_assignments: NO anon read. Service role only.

-- All writes go through API routes using service role key.
