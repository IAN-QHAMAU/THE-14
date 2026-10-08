import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import {
  getGameById,
  getPlayers,
  getCurrentRound,
  hasPlayerAnswered,
  getPlayerAnswer,
  getPlayerScores,
  getGameEvents,
  getRevealData,
  getSubmissionStatus,
} from '@/lib/db/queries'
import { QUESTIONS } from '@/lib/game/questions'

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

  // Strip sensitive fields from players list
  const safePlayers = players.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar ?? 'ninja',
    is_game_master: p.is_game_master,
    is_connected: p.is_connected,
    score: p.score,
    status: p.status,
  }))

  // Player's answer for current round
  const submitted = round && !isGameMaster
    ? await hasPlayerAnswered(round.id, playerId)
    : false

  const selectedOption = round && !isGameMaster && submitted
    ? await getPlayerAnswer(round.id, playerId)
    : null

  // GM submission tracking
  let submissionStatus: Record<string, boolean> = {}
  if (isGameMaster && round) {
    const realPlayers = players.filter((p) => !p.is_game_master)
    submissionStatus = await getSubmissionStatus(round.id, realPlayers.map((p) => p.id))
  }

  // Current question (safe to send — no answer revealed until reveal phase)
  let currentQuestion = null
  if (round?.question_id) {
    const allQuestions = Object.values(QUESTIONS).flat()
    const q = allQuestions.find((q) => q.id === round.question_id)
    if (q) {
      // Never send the correct answer index until revealing
      const isRevealing = round.status === 'revealing' || game.status === 'question_result'
      currentQuestion = {
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        points: q.points,
        speedBonus: q.speedBonus,
        // Only send correct answer during reveal
        correct: isRevealing ? q.correct : -1,
      }
    }
  }

  // Reveal data (answer stats from event log)
  let revealData = null
  if (round && (round.status === 'revealing') && round.id) {
    revealData = await getRevealData(round.id)
  }

  // Scores
  const scores = ['question_result', 'finished', 'category'].includes(game.status)
    ? await getPlayerScores(gameId)
    : []

  // My rank
  const sortedScores = [...scores].sort((a, b) => b.total - a.total)
  const myRank = sortedScores.findIndex((s) => s.player_id === playerId) + 1
  const myScore = scores.find((s) => s.player_id === playerId)?.total ?? 0

  const events = await getGameEvents(gameId, 20)

  return NextResponse.json({
    game,
    players: safePlayers,
    myPlayer,
    currentRound: round,
    currentQuestion,
    submitted,
    selectedOption,
    submissionStatus,
    revealData,
    scores,
    myRank,
    myScore,
    events,
    isGameMaster,
  })
}
