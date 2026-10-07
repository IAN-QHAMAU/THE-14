import { createServerSupabase } from '@/lib/db/supabase'
import type { GameStatus, RoundStatus } from '@/types'

const db = () => createServerSupabase()

// ─── Game transitions ──────────────────────────────────────────────────────

export async function startGame(gameId: string) {
  const client = db()
  await client
    .from('games')
    .update({ status: 'briefing' as GameStatus, started_at: new Date().toISOString() })
    .eq('id', gameId)

  await logEvent(gameId, null, 'game_started', null, null, {})
}

export async function advanceGameToActive(gameId: string) {
  const client = db()
  await client
    .from('games')
    .update({ status: 'active' as GameStatus })
    .eq('id', gameId)
}

export async function endGame(gameId: string) {
  const client = db()
  await client
    .from('games')
    .update({ status: 'finished' as GameStatus, ended_at: new Date().toISOString() })
    .eq('id', gameId)

  await logEvent(gameId, null, 'game_ended', null, null, {})
}

// ─── Round transitions ─────────────────────────────────────────────────────

export async function startRound(roundId: string, gameId: string, durationSeconds = 120) {
  const client = db()
  const now = new Date()
  const ends = new Date(now.getTime() + durationSeconds * 1000)

  await client
    .from('rounds')
    .update({
      status: 'active' as RoundStatus,
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
    })
    .eq('id', roundId)

  await logEvent(gameId, roundId, 'round_started', null, null, { round_id: roundId })
}

export async function lockRound(roundId: string, gameId: string) {
  const client = db()
  await client
    .from('rounds')
    .update({ status: 'locked' as RoundStatus })
    .eq('id', roundId)

  await logEvent(gameId, roundId, 'round_locked', null, null, {})
}

export async function revealRound(roundId: string, gameId: string) {
  const client = db()
  await client
    .from('rounds')
    .update({ status: 'revealing' as RoundStatus })
    .eq('id', roundId)

  await logEvent(gameId, roundId, 'reveal_triggered', null, null, {})
}

export async function completeRound(roundId: string, gameId: string) {
  const client = db()

  // Get round number
  const { data: round } = await client.from('rounds').select('round_number').eq('id', roundId).single()

  await client
    .from('rounds')
    .update({ status: 'complete' as RoundStatus })
    .eq('id', roundId)

  await client
    .from('games')
    .update({ current_round: (round?.round_number ?? 0) + 1 })
    .eq('id', gameId)

  await logEvent(gameId, roundId, 'round_completed', null, null, {})
}

// ─── Scoring ───────────────────────────────────────────────────────────────

export async function awardPoints(
  gameId: string,
  playerId: string,
  roundId: string,
  points: number,
  reason: string
) {
  const client = db()
  await client.from('scores').insert({ game_id: gameId, player_id: playerId, round_id: roundId, points, reason })

  // Update cumulative score
  const { data: player } = await client.from('players').select('score').eq('id', playerId).single()
  await client
    .from('players')
    .update({ score: (player?.score ?? 0) + points })
    .eq('id', playerId)

  await logEvent(gameId, roundId, 'score_changed', playerId, null, { points, reason })
}

// ─── Events ────────────────────────────────────────────────────────────────

export async function logEvent(
  gameId: string,
  roundId: string | null,
  eventType: string,
  actorId: string | null,
  targetId: string | null,
  payload: Record<string, unknown>
) {
  const client = db()
  await client.from('events').insert({
    game_id: gameId,
    round_id: roundId,
    event_type: eventType,
    actor_id: actorId,
    target_id: targetId,
    payload,
  })
}

// ─── Default game setup ────────────────────────────────────────────────────

export const DEFAULT_ROLES = [
  {
    role_name: 'The Broker',
    secret_objective: 'Ensure Team B receives more than 500 points in any round.',
    private_information: 'You know that two other players are secretly on Team B.',
    special_ability: 'Once per game, you may double your vote weight.',
  },
  {
    role_name: 'The Analyst',
    secret_objective: 'Correctly predict the outcome of two rounds.',
    private_information: 'You can see the total votes cast before others.',
    special_ability: null,
  },
  {
    role_name: 'The Disruptor',
    secret_objective: 'Cause at least one round to end in a tie.',
    private_information: 'You know who the Broker is.',
    special_ability: 'Once per game, you may cancel one vote.',
  },
  {
    role_name: 'The Loyalist',
    secret_objective: 'Always vote with the majority. Score 50 points per aligned round.',
    private_information: 'None. You play in the open.',
    special_ability: null,
  },
  {
    role_name: 'The Shadow',
    secret_objective: 'Never be correctly accused by another player.',
    private_information: 'You know one other player\'s objective.',
    special_ability: 'Once per game, you may pass your turn invisibly.',
  },
  {
    role_name: 'The Architect',
    secret_objective: 'Ensure the final score gap between first and last is under 100 points.',
    private_information: 'You see the current leaderboard at all times.',
    special_ability: null,
  },
  {
    role_name: 'The Envoy',
    secret_objective: 'Form an alliance with another player and both must score above 200.',
    private_information: 'You may send one anonymous message per round.',
    special_ability: 'Send one private message per round.',
  },
  {
    role_name: 'The Auditor',
    secret_objective: 'Identify the Broker before the final round.',
    private_information: 'You see all vote totals (not who voted).',
    special_ability: null,
  },
  {
    role_name: 'The Contrarian',
    secret_objective: 'Vote against the majority in at least two rounds.',
    private_information: 'None.',
    special_ability: null,
  },
  {
    role_name: 'The Insider',
    secret_objective: 'Team B must win two out of three rounds.',
    private_information: 'You know the identity of The Broker.',
    special_ability: null,
  },
  {
    role_name: 'The Watcher',
    secret_objective: 'Accumulate the most points without ever being accused.',
    private_information: 'You see who accuses whom in real time.',
    special_ability: null,
  },
  {
    role_name: 'The Mediator',
    secret_objective: 'Prevent any single player from winning by more than 150 points.',
    private_information: 'You know the top scorer after each round.',
    special_ability: null,
  },
  {
    role_name: 'The Phantom',
    secret_objective: 'Never submit first in any round.',
    private_information: 'You see submission order in real time.',
    special_ability: null,
  },
  {
    role_name: 'The Catalyst',
    secret_objective: 'Trigger at least two live events during the game.',
    private_information: 'You have two secret action tokens.',
    special_ability: 'Trigger a secret action twice per game.',
  },
]

export const DEFAULT_ROUNDS = [
  {
    round_number: 1,
    title: 'THE SPLIT',
    description: 'Your group must divide 1,000 points between Team A and Team B. Majority rules — but not everyone wants the same outcome.',
  },
  {
    round_number: 2,
    title: 'THE VOTE',
    description: 'Each player votes to eliminate one of three proposals. The surviving proposal becomes group policy — and scores points differently for different players.',
  },
  {
    round_number: 3,
    title: 'THE FINAL HAND',
    description: 'Each player secretly allocates their remaining tokens. Hidden agendas collide. The final reveal determines everything.',
  },
]
