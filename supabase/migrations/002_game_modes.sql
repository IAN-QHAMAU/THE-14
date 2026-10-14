-- ─────────────────────────────────────────────────────────────────────────────
-- THE 14: game modes, streaks and settings
--
-- Run this once in the Supabase SQL Editor on an existing database.
-- It keeps all existing data. Fresh installs can just run schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- Game setup chosen by the GM: categories, game types, timer, question count.
alter table games   add column if not exists settings    jsonb   not null default '{}';

-- Per round extras: order shuffle, players to vote on, bluff options.
alter table rounds  add column if not exists data        jsonb   not null default '{}';

-- Streak tracking.
alter table players add column if not exists streak      integer not null default 0;
alter table players add column if not exists best_streak integer not null default 0;

-- Bluff rounds need two actions per player (the fake answer, then the vote).
alter table actions drop constraint if exists actions_round_id_player_id_key;
alter table actions drop constraint if exists actions_round_player_type_key;
alter table actions add constraint actions_round_player_type_key unique (round_id, player_id, action_type);

select 'migration 002 ready' as result;
