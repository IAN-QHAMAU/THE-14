import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import {
  getGameById,
  getPlayers,
  getCurrentRound,
  getMyActions,
  getRoundActions,
  getRevealForRound,
  getLatestReveal,
  getGameEnd,
  getGameEvents,
  getEventsOfTypes,
  toScoreEntries,
} from '@/lib/db/queries'
import { teamsFromEvents } from '@/lib/game/teams'
import { powerLine, powerState } from '@/lib/game/powers'
import { getQuestionById, phaseAction, toPublicQuestion } from '@/lib/game/questions'
import { createServerSupabase } from '@/lib/db/supabase'
import { HEARTBEAT_MS, isActive } from '@/lib/presence'
import type { GameStateResponse, Player } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Taken first, for clock sync: when the server received the request.
  const serverStart = Date.now()
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const { playerId, gameId, isGameMaster } = session

  const [game, players, round] = await Promise.all([
    getGameById(gameId),
    getPlayers(gameId),
    getCurrentRound(gameId),
  ])

  if (!game) return NextResponse.json({ error: 'Game not found.' }, { status: 404 })

  const myPlayer = players.find((p) => p.id === playerId) ?? null
  const realPlayers = players.filter((p) => !p.is_game_master)

  // The host removed this player: send them back to the join page.
  if (!isGameMaster && !myPlayer) {
    return NextResponse.json({ error: 'You are no longer in this game.' }, { status: 401 })
  }

  // Presence check-in, throttled so it does not write on every fetch.
  const nowMs = Date.now()
  if (myPlayer && (!myPlayer.last_seen_at || nowMs - Date.parse(myPlayer.last_seen_at) > HEARTBEAT_MS)) {
    myPlayer.last_seen_at = new Date(nowMs).toISOString()
    await createServerSupabase()
      .from('players')
      .update({ last_seen_at: myPlayer.last_seen_at, is_connected: true })
      .eq('id', myPlayer.id)
  }

  const safePlayers = players.map((p) => ({
    id: p.id,
    game_id: p.game_id,
    name: p.name,
    avatar: p.avatar ?? 'ninja',
    is_game_master: p.is_game_master,
    is_connected: p.is_game_master || isActive(p.last_seen_at, nowMs),
    score: p.score,
    streak: p.streak ?? 0,
    best_streak: p.best_streak ?? 0,
    status: p.status,
    joined_at: p.joined_at,
    last_seen_at: p.last_seen_at,
  })) as Player[]

  // Current question, without the answer.
  const question = round ? getQuestionById(round.question_id) : undefined
  const currentQuestion = question ? toPublicQuestion(question, round?.data) : null

  // Who has submitted for the current phase.
  let submissionStatus: Record<string, boolean> = {}
  let answeredCount = 0
  if (round && ['active', 'voting'].includes(round.status)) {
    const actions = await getRoundActions(round.id)
    const phaseType = phaseAction(round.data?.phase)
    const done = new Set(actions.filter((a) => a.action_type === phaseType).map((a) => a.player_id))
    submissionStatus = Object.fromEntries(realPlayers.map((p) => [p.id, done.has(p.id)]))
    answeredCount = done.size
  }

  const mine = round && !isGameMaster ? await getMyActions(round.id, playerId) : { answer: null, bluff: null, wager: null, pick: null }

  const reveal = round && game.status === 'question_result' ? await getRevealForRound(round.id) : null
  const lastReveal = game.status === 'leaderboard' || game.status === 'finished' ? await getLatestReveal(gameId) : null
  const end = game.status === 'finished' ? await getGameEnd(gameId) : { awards: [], stats: {}, tags: {} }

  const scores = toScoreEntries(players)
  const myScore = myPlayer?.score ?? 0
  const myRank = isGameMaster ? 0 : scores.filter((s) => s.total > myScore).length + 1

  const events = isGameMaster ? await getGameEvents(gameId, 20) : []

  // Team Battle and Power-ups, read from the event log.
  const extras = game.settings?.teams || game.settings?.powerUps
    ? await getEventsOfTypes(gameId, ['team_pick', 'power_earned', 'power_played'])
    : []
  const teams = game.settings?.teams ? teamsFromEvents(extras.filter((e) => e.event_type === 'team_pick')) : {}
  const powerEvents = extras.filter((e) => e.event_type !== 'team_pick')
  const power = game.settings?.powerUps ? powerState(powerEvents) : null
  const nameOf = (id: string | null) => players.find((p) => p.id === id)?.name ?? 'Someone'
  const fx = power && round ? power.effects[round.round_number] : undefined

  const response: GameStateResponse = {
    serverStart,
    serverNow: Date.now(),
    game,
    players: safePlayers,
    myPlayer,
    isGameMaster,
    currentRound: round,
    currentQuestion,
    myAnswer: mine.answer,
    myBluff: mine.bluff?.text ?? null,
    myWager: mine.wager?.value ?? null,
    // A written answer counts as picked too (-1: not one of the options).
    myPick: mine.pick?.option_index ?? (mine.pick?.text ? -1 : null),
    myPickText: mine.pick?.text ?? null,
    // Sketch: only the artist sees the word while the round is live.
    myWord:
      question?.type === 'sketch' && round?.data?.sync?.id === playerId && game.status === 'active'
        ? question.word
        : null,
    teams,
    myCard: power && !isGameMaster ? power.held[playerId] ?? null : null,
    myEffects: fx && !isGameMaster
      ? { frozen: fx.frozen.includes(playerId), shuffled: fx.shuffled.includes(playerId), doubled: fx.doubled.includes(playerId) }
      : null,
    powerFeed: powerEvents.slice(-6).map((e) => ({ id: e.id, text: powerLine(e, nameOf), at: e.created_at })).filter((e) => e.text),
    submissionStatus,
    answeredCount,
    reveal,
    lastReveal,
    scores,
    myRank,
    myScore,
    awards: end.awards,
    stats: end.stats,
    tags: end.tags,
    events,
  }
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } })
}
