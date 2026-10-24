import { createServerSupabase } from '@/lib/db/supabase'
import { getAllReveals, getEventsOfTypes, getRoundActions } from '@/lib/db/queries'
import { smallerTeam, teamsFromEvents } from '@/lib/game/teams'
import { DOUBLE_DOWN_LOSS, POWER_IDS, STREAK_FOR_CARD, powerState, type PowerCard } from '@/lib/game/powers'
import {
  GET_READY_MS,
  answerWindowSeconds,
  getQuestionById,
  pickQuestions,
  shuffle,
  type GameSettings,
  type Question,
  type RoundData,
} from '@/lib/game/questions'
import { buildBluffOptions, buildSyncOptions, computeAwards, computePlayerStats, computeRanks, computeTags, gradeRound } from '@/lib/game/scoring'
import { isActive } from '@/lib/presence'
import type { Game, GameStatus, Player, Round, RoundStatus } from '@/types'

const db = () => createServerSupabase()

// ─── Setup ─────────────────────────────────────────────────────────────────

export async function setupGame(gameId: string, settings: GameSettings) {
  const client = db()
  const questions = pickQuestions(settings)
  if (!questions.length) return { error: 'No questions match that setup.' }
  const wager = settings.finalWager ? moveBetToEnd(questions) : false

  await client.from('rounds').delete().eq('game_id', gameId)
  await client.from('scores').delete().eq('game_id', gameId)
  await client.from('events').delete().eq('game_id', gameId).neq('event_type', 'team_pick')
  const { error: insertError } = await client.from('rounds').insert(
    questions.map((q, i) => ({
      game_id: gameId,
      round_number: i + 1,
      title: `Question ${i + 1}`,
      description: q.question,
      question_id: q.id,
      status: 'pending' as RoundStatus,
      data: wager && i === questions.length - 1 ? { wager: true } : {},
    })),
  )
  if (insertError) {
    // Most likely the database is missing the columns added in migration 002.
    return { error: 'Could not set up questions. Run supabase/migrations/002_game_modes.sql in Supabase.' }
  }

  await client
    .from('players')
    .update({ score: 0, streak: 0, best_streak: 0 })
    .eq('game_id', gameId)
  if (settings.teams) await fillTeams(gameId)

  await client
    .from('games')
    .update({
      status: 'category' as GameStatus,
      category: settings.categories.length === 1 ? settings.categories[0] : 'mix',
      settings: { ...settings, questionCount: questions.length },
      total_questions: questions.length,
      current_round: 0,
      started_at: new Date().toISOString(),
      ended_at: null,
    })
    .eq('id', gameId)

  await logEvent(gameId, null, 'game_started', { questions: questions.length })
  return { error: null }
}

/** Team Battle: anyone who has not picked a side joins the smaller team. */
async function fillTeams(gameId: string) {
  const [players, picks] = await Promise.all([
    db().from('players').select('id').eq('game_id', gameId).eq('is_game_master', false),
    getEventsOfTypes(gameId, ['team_pick']),
  ])
  const ids = (players.data ?? []).map((p) => p.id as string)
  const teams = teamsFromEvents(picks)
  for (const id of ids) {
    if (teams[id]) continue
    teams[id] = smallerTeam(teams, ids)
    await db().from('events').insert({ game_id: gameId, event_type: 'team_pick', actor_id: id, payload: { team: teams[id], auto: true } })
  }
}

/** Questions with one clear right answer, good for a bet. */
const BET_TYPES = ['choice', 'truefalse', 'oddone', 'emoji', 'picture']

/** Final Wager: move a question with a clear right answer to the end. */
function moveBetToEnd(questions: Question[]) {
  for (let i = questions.length - 1; i >= 0; i--) {
    if (!BET_TYPES.includes(questions[i].type)) continue
    questions.push(...questions.splice(i, 1))
    return true
  }
  return false
}

/** Back to the lobby with the same players, ready for another game. */
export async function resetGame(gameId: string) {
  const client = db()
  await client.from('rounds').delete().eq('game_id', gameId)
  await client.from('scores').delete().eq('game_id', gameId)
  await client.from('events').delete().eq('game_id', gameId).neq('event_type', 'team_pick')
  await client.from('players').update({ score: 0, streak: 0, best_streak: 0 }).eq('game_id', gameId)
  await client
    .from('games')
    .update({ status: 'waiting' as GameStatus, current_round: 1, total_questions: 0, ended_at: null })
    .eq('id', gameId)
}

// ─── Questions ─────────────────────────────────────────────────────────────

async function completeOpenRounds(gameId: string) {
  await db()
    .from('rounds')
    .update({ status: 'complete' as RoundStatus })
    .eq('game_id', gameId)
    .in('status', ['revealing', 'locked'])
}

/**
 * Starts the next question. Returns 'busy' when another host screen (or a
 * double tap) already moved the game on, so the same step never runs twice.
 */
export async function startNextQuestion(game: Game, players: Player[]): Promise<Round | null | 'busy'> {
  const client = db()

  const { data: rounds } = await client
    .from('rounds')
    .select('*')
    .eq('game_id', game.id)
    .eq('status', 'pending')
    .order('round_number')
    .limit(1)

  const round = rounds?.[0] as Round | undefined
  if (!round) return null

  const question = getQuestionById(round.question_id)
  if (!question) return null

  const timer = game.settings?.timer ?? 20
  const data: RoundData = round.data?.wager ? { wager: true, phase: 'wager' } : {}
  if (question.type === 'order') {
    let perm = shuffle(question.items.map((_, i) => i))
    // Never show the items already in the right order.
    if (perm.every((p, i) => p === i)) perm = [...perm.slice(1), perm[0]]
    data.perm = perm
  }
  if (question.type === 'mostlikely') {
    // Only players still in the room are up for the vote.
    const everyone = players.filter((p) => !p.is_game_master)
    const here = everyone.filter((p) => isActive(p.last_seen_at))
    data.players = (here.length ? here : everyone).map((p) => ({ id: p.id, name: p.name, avatar: p.avatar }))
  }
  if (question.type === 'bluff') data.phase = 'write'
  if (question.type === 'sketch') data.sync = await pickSync(game.id, players)
  if (question.type === 'sync') {
    data.sync = await pickSync(game.id, players)
    data.phase = 'pick'
  }

  // Claim the step: only one caller can move the game from this exact state.
  const { data: claimed } = await client
    .from('games')
    .update({ status: 'active' as GameStatus, current_round: round.round_number })
    .eq('id', game.id)
    .eq('current_round', game.current_round)
    .in('status', ['category', 'question_result', 'leaderboard'])
    .select('id')
  if (!claimed?.length) return 'busy'

  await completeOpenRounds(game.id)

  const startsAt = new Date(Date.now() + GET_READY_MS)
  const seconds = answerWindowSeconds(question.type, timer, data.phase)
  const endsAt = new Date(startsAt.getTime() + seconds * 1000)

  await client
    .from('rounds')
    .update({
      status: 'active' as RoundStatus,
      data,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq('id', round.id)
    .eq('status', 'pending')

  await logEvent(game.id, round.id, 'round_started', { round_number: round.round_number })
  return round
}

/** The player for a Sync round: someone here who has not had a turn yet. */
async function pickSync(gameId: string, players: Player[]) {
  const everyone = players.filter((p) => !p.is_game_master)
  const here = everyone.filter((p) => isActive(p.last_seen_at))
  const { data: past } = await db().from('rounds').select('data').eq('game_id', gameId).neq('status', 'pending')
  const had = new Set((past ?? []).map((r) => (r.data as RoundData | null)?.sync?.id).filter(Boolean))
  const pool = here.length ? here : everyone
  const fresh = pool.filter((p) => !had.has(p.id))
  const p = shuffle(fresh.length ? fresh : pool)[0]
  return p ? { id: p.id, name: p.name, avatar: p.avatar } : undefined
}

/**
 * Two step rounds: close the first step and open the second for everyone.
 * Bluff goes from writing fakes to voting, Final Wager from bets to the
 * question, and Sync from the player's own answer to everyone guessing.
 */
export async function startSecondPhase(game: Game, round: Round) {
  const question = getQuestionById(round.question_id)
  const phase = round.data?.phase
  if (!question || (phase !== 'write' && phase !== 'wager' && phase !== 'pick')) return { error: 'Nothing to move on to.' }

  const actions = await getRoundActions(round.id)
  const data: RoundData = { ...round.data, phase: 'vote' }
  if (question.type === 'bluff' && phase === 'write') {
    data.options = buildBluffOptions(question, actions.filter((a) => a.action_type === 'bluff'), round.id)
  }
  if (question.type === 'sync' && phase === 'pick') {
    data.options = buildSyncOptions(question.options, actions.find((a) => a.action_type === 'pick')?.payload, round.id)
  }
  // Nobody to guess about if the player who goes first never answered.
  if (phase === 'pick' && !actions.some((a) => a.action_type === 'pick')) return lockAndRevealQuestion(game.id, round)

  const startsAt = new Date(Date.now() + 1500)
  const endsAt = new Date(startsAt.getTime() + answerWindowSeconds(question.type, game.settings?.timer ?? 20) * 1000)

  // Only move on if the round is still in its first step.
  const { data: updated } = await db()
    .from('rounds')
    .update({
      status: 'voting' as RoundStatus,
      data,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq('id', round.id)
    .eq('status', 'active')
    .select('id')

  if (!updated?.length) return { error: 'Already moved on.' }
  await logEvent(game.id, round.id, 'voting_started', {})
  return { error: null }
}

export async function lockAndRevealQuestion(gameId: string, round: Round) {
  const client = db()

  // Lock atomically so a double tap cannot award points twice.
  const { data: locked } = await client
    .from('rounds')
    .update({ status: 'locked' as RoundStatus })
    .eq('id', round.id)
    .in('status', ['active', 'voting'])
    .select('id')
  if (!locked?.length) return { error: 'Already revealed.' }

  const question = getQuestionById(round.question_id)
  if (!question) return { error: 'Question missing.' }

  const [{ data: playerRows }, answers] = await Promise.all([
    client.from('players').select('id, score, streak, best_streak').eq('game_id', gameId).eq('is_game_master', false),
    getRoundActions(round.id),
  ])
  const players = (playerRows ?? []) as { id: string; score: number; streak: number; best_streak: number }[]

  const graded = gradeRound({ question, data: round.data ?? {}, answers, players })

  // Power-ups: Double Down on this question, and new cards for streaks.
  const { data: gameRow } = await client.from('games').select('settings').eq('id', gameId).single()
  const earned: { id: string; card: PowerCard }[] = []
  if ((gameRow?.settings as { powerUps?: boolean } | null)?.powerUps) {
    const power = powerState(await getEventsOfTypes(gameId, ['power_earned', 'power_played']))
    for (const id of power.effects[round.round_number]?.doubled ?? []) {
      const r = graded.results[id]
      if (!r) continue
      // Vote rounds have no right answer: siding with the room counts as a win.
      const won = r.correct === true || (r.correct === null && r.points > 0)
      r.points = won ? r.points * 2 : r.points - DOUBLE_DOWN_LOSS
      r.doubled = true
    }
    for (const p of players) {
      const r = graded.results[p.id]
      // Only a streak that just grew counts (party rounds leave it as it was).
      if (!r?.correct || r.streak <= (p.streak ?? 0) || r.streak % STREAK_FOR_CARD !== 0 || power.held[p.id]) continue
      const card = POWER_IDS[Math.floor(Math.random() * POWER_IDS.length)]
      r.earned = card
      earned.push({ id: p.id, card })
    }
  }

  const before = Object.fromEntries(players.map((p) => [p.id, p.score]))
  // A lost bet can take points away, but never below zero.
  const after = Object.fromEntries(players.map((p) => [p.id, Math.max(0, p.score + (graded.results[p.id]?.points ?? 0))]))

  const scoreRows = players
    .filter((p) => (graded.results[p.id]?.points ?? 0) > 0)
    .map((p) => ({
      game_id: gameId,
      player_id: p.id,
      round_id: round.id,
      points: graded.results[p.id].points,
      reason: `Q${round.round_number}`,
    }))
  if (scoreRows.length) await client.from('scores').insert(scoreRows)

  await Promise.all(
    players.map((p) => {
      const r = graded.results[p.id]
      return client
        .from('players')
        .update({
          score: after[p.id],
          streak: r?.streak ?? p.streak,
          best_streak: Math.max(p.best_streak ?? 0, r?.streak ?? 0),
        })
        .eq('id', p.id)
    }),
  )

  const payload = { ...graded, rank_before: computeRanks(before), rank_after: computeRanks(after) }

  // Save the reveal before flipping the status so phones never see a reveal
  // screen without its data.
  await logEvent(gameId, round.id, 'reveal_triggered', payload as unknown as Record<string, unknown>)
  if (earned.length) {
    await client.from('events').insert(earned.map((e) => ({ game_id: gameId, round_id: round.id, event_type: 'power_earned', actor_id: e.id, payload: { card: e.card } })))
  }
  await client.from('rounds').update({ status: 'revealing' as RoundStatus }).eq('id', round.id)
  await client.from('games').update({ status: 'question_result' as GameStatus }).eq('id', gameId)

  return { error: null }
}

export async function showLeaderboard(gameId: string) {
  const { data: claimed } = await db()
    .from('games')
    .update({ status: 'leaderboard' as GameStatus })
    .eq('id', gameId)
    .eq('status', 'question_result')
    .select('id')
  if (!claimed?.length) return
  await completeOpenRounds(gameId)
}

export async function hasPendingRounds(gameId: string) {
  const { data } = await db()
    .from('rounds')
    .select('id')
    .eq('game_id', gameId)
    .eq('status', 'pending')
    .limit(1)
  return Boolean(data?.length)
}

export async function finishGame(gameId: string) {
  const client = db()
  await completeOpenRounds(gameId)

  const [reveals, { data: players }] = await Promise.all([
    getAllReveals(gameId),
    client.from('players').select('id, score, best_streak').eq('game_id', gameId).eq('is_game_master', false),
  ])
  const awards = computeAwards(reveals, players ?? [])
  const stats = computePlayerStats(reveals, players ?? [])
  const tags = computeTags(stats, players ?? [], awards)

  // Only the first caller finishes the game and records the awards.
  const { data: claimed } = await client
    .from('games')
    .update({ status: 'finished' as GameStatus, ended_at: new Date().toISOString() })
    .eq('id', gameId)
    .neq('status', 'finished')
    .select('id')
  if (!claimed?.length) return
  await logEvent(gameId, null, 'game_ended', { awards, stats, tags })
}

// ─── Events ────────────────────────────────────────────────────────────────

export async function logEvent(
  gameId: string,
  roundId: string | null,
  eventType: string,
  payload: Record<string, unknown>,
) {
  await db().from('events').insert({
    game_id: gameId,
    round_id: roundId,
    event_type: eventType,
    payload,
  })
}

