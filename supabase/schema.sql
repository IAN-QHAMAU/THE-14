-- ─────────────────────────────────────────────────────────────────────────────
-- THE 14 — Quiz Edition
-- Database Schema
--
-- Setup instructions:
-- 1. Run this entire file in Supabase SQL Editor
-- 2. If the realtime block fails, run it separately as a second query
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── DROP EXISTING (safe migration) ───────────────────────────────────────────

drop table if exists scores    cascade;
drop table if exists actions   cascade;
drop table if exists events    cascade;
drop table if exists rounds    cascade;
drop table if exists players   cascade;
drop table if exists games     cascade;

-- ─── GAMES ────────────────────────────────────────────────────────────────────
-- One row per game session.
-- status flow: waiting → category → active → question_result → finished

create table games (
  id               uuid primary key default gen_random_uuid(),
  game_code        text not null unique,
  status           text not null default 'waiting',
  current_round    integer not null default 1,
  max_players      integer not null default 14,
  category         text,
  total_questions  integer not null default 0,
  created_at       timestamptz not null default now(),
  started_at       timestamptz,
  ended_at         timestamptz
);

-- ─── PLAYERS ──────────────────────────────────────────────────────────────────
-- One row per person in the game, including the Game Master.
-- is_game_master = true means this player controls the game flow.

create table players (
  id              uuid primary key default gen_random_uuid(),
  game_id         uuid not null references games(id) on delete cascade,
  name            text not null,
  avatar          text not null default 'ninja',
  is_game_master  boolean not null default false,
  is_connected    boolean not null default true,
  joined_at       timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  score           integer not null default 0,
  status          text not null default 'waiting'
);

-- ─── ROUNDS ───────────────────────────────────────────────────────────────────
-- One row per question. Created in bulk when GM starts the game.
-- question_id references a question in the app's questions.ts file (not in DB).
-- status flow: pending → active → locked → revealing → complete

create table rounds (
  id            uuid primary key default gen_random_uuid(),
  game_id       uuid not null references games(id) on delete cascade,
  round_number  integer not null,
  title         text not null,
  description   text not null,
  question_id   text not null,
  status        text not null default 'pending',
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- ─── ACTIONS ──────────────────────────────────────────────────────────────────
-- One row per player per round. Records the answer they submitted.
-- payload: { option_index, answered_at, time_taken_ms }
-- unique constraint prevents double submissions.

create table actions (
  id           uuid primary key default gen_random_uuid(),
  round_id     uuid not null references rounds(id) on delete cascade,
  player_id    uuid not null references players(id) on delete cascade,
  action_type  text not null default 'answer',
  payload      jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  unique (round_id, player_id)
);

-- ─── EVENTS ───────────────────────────────────────────────────────────────────
-- Append-only log of everything that happens in a game.
-- Used for the GM event feed, reveal data, and realtime triggers.
-- event_type examples: game_started, round_started, reveal_triggered,
--                      round_completed, game_ended, score_changed

create table events (
  id          uuid primary key default gen_random_uuid(),
  game_id     uuid not null references games(id) on delete cascade,
  round_id    uuid references rounds(id) on delete set null,
  event_type  text not null,
  actor_id    uuid references players(id) on delete set null,
  target_id   uuid references players(id) on delete set null,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- ─── SCORES ───────────────────────────────────────────────────────────────────
-- Individual point awards per player per round.
-- The cumulative score is also stored on players.score for fast reads.

create table scores (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid not null references games(id) on delete cascade,
  player_id  uuid not null references players(id) on delete cascade,
  round_id   uuid not null references rounds(id) on delete cascade,
  points     integer not null,
  reason     text not null,
  created_at timestamptz not null default now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

create index on players(game_id);
create index on rounds(game_id);
create index on rounds(status);
create index on actions(round_id);
create index on actions(player_id);
create index on events(game_id);
create index on events(round_id);
create index on scores(game_id);
create index on scores(player_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- All writes go through API routes using the service role key (bypasses RLS).
-- Public read is allowed — sensitive data like answers are filtered in the API.

alter table games   enable row level security;
alter table players enable row level security;
alter table rounds  enable row level security;
alter table actions enable row level security;
alter table events  enable row level security;
alter table scores  enable row level security;

create policy "games_read"   on games   for select using (true);
create policy "players_read" on players for select using (true);
create policy "rounds_read"  on rounds  for select using (true);
create policy "events_read"  on events  for select using (true);
create policy "scores_read"  on scores  for select using (true);
create policy "actions_read" on actions for select using (true);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Enables live updates for game state, players, questions and events.
-- scores is excluded — read via API only.

alter publication supabase_realtime add table games;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table rounds;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table actions;

select 'schema ready' as result;