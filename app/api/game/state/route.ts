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
  getAwards,
  getGameEvents,
  toScoreEntries,
} from '@/lib/db/queries'
import { getQuestionById, toPublicQuestion } from '@/lib/game/questions'
import type { GameStateResponse, Player } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
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

  const safePlayers = players.map((p) => ({
    id: p.id,
    game_id: p.game_id,
    name: p.name,
    avatar: p.avatar ?? 'ninja',
    is_game_master: p.is_game_master,
    is_connected: p.is_connected,
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
    const phaseType = round.data?.phase === 'write' ? 'bluff' : 'answer'
    const done = new Set(actions.filter((a) => a.action_type === phaseType).map((a) => a.player_id))
    submissionStatus = Object.fromEntries(realPlayers.map((p) => [p.id, done.has(p.id)]))
    answeredCount = done.size
  }

  const mine = round && !isGameMaster ? await getMyActions(round.id, playerId) : { answer: null, bluff: null }

  const reveal = round && game.status === 'question_result' ? await getRevealForRound(round.id) : null
  const lastReveal = game.status === 'leaderboard' || game.status === 'finished' ? await getLatestReveal(gameId) : null
  const awards = game.status === 'finished' ? await getAwards(gameId) : []

  const scores = toScoreEntries(players)
  const myScore = myPlayer?.score ?? 0
  const myRank = isGameMaster ? 0 : scores.filter((s) => s.total > myScore).length + 1

  const events = isGameMaster ? await getGameEvents(gameId, 20) : []

  const response: GameStateResponse = {
    serverNow: Date.now(),
    game,
    players: safePlayers,
    myPlayer,
    isGameMaster,
    currentRound: round,
    currentQuestion,
    myAnswer: mine.answer,
    myBluff: mine.bluff?.text ?? null,
    submissionStatus,
    answeredCount,
    reveal,
    lastReveal,
    scores,
    myRank,
    myScore,
    awards,
    events,
  }
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } })
}
