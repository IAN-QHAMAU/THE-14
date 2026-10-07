import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import {
  getGameById,
  getPlayers,
  getCurrentRound,
  getPlayerRole,
  getRoundAssignment,
  hasPlayerSubmitted,
  getPlayerScores,
  getGameEvents,
} from '@/lib/db/queries'
import { createServerSupabase } from '@/lib/db/supabase'

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

  // Only fetch private role info for the requesting player (never expose others)
  const myRole = !isGameMaster ? await getPlayerRole(playerId, gameId) : null
  const myAssignment = round && !isGameMaster
    ? await getRoundAssignment(round.id, playerId)
    : null
  const submitted = round && !isGameMaster
    ? await hasPlayerSubmitted(round.id, playerId)
    : false

  // Strip sensitive fields from other players
  const safePlayers = players.map((p) => ({
    id: p.id,
    name: p.name,
    is_game_master: p.is_game_master,
    is_connected: p.is_connected,
    score: p.score,
    status: p.status,
  }))

  // GM gets submission status per player
  let submissionStatus: Record<string, boolean> = {}
  if (isGameMaster && round) {
    const db = createServerSupabase()
    const { data: actions } = await db
      .from('actions')
      .select('player_id')
      .eq('round_id', round.id)
    const submitted = new Set((actions ?? []).map((a) => a.player_id))
    const realPlayers = players.filter((p) => !p.is_game_master)
    submissionStatus = Object.fromEntries(realPlayers.map((p) => [p.id, submitted.has(p.id)]))
  }

  // Reveal data (only during revealing/finished states)
  let revealData = null
  if (round && (round.status === 'revealing' || round.status === 'complete') && !isGameMaster) {
    const db = createServerSupabase()
    const { data: actions } = await db
      .from('actions')
      .select('payload')
      .eq('round_id', round.id)

    if (actions?.length) {
      const splits = actions.map((a) => {
        const p = a.payload as Record<string, number>
        return { teamA: p.teamA ?? 500, teamB: p.teamB ?? 500 }
      })
      const totalA = splits.reduce((s, x) => s + x.teamA, 0)
      const totalB = splits.reduce((s, x) => s + x.teamB, 0)
      const count = splits.length
      revealData = {
        teamA: Math.round(totalA / count),
        teamB: Math.round(totalB / count),
        submissionCount: count,
      }
    }
  }

  const events = await getGameEvents(gameId, 20)
  const scores = game.status === 'finished' || game.status === 'revealing'
    ? await getPlayerScores(gameId)
    : []

  return NextResponse.json({
    game,
    players: safePlayers,
    myPlayer,
    myRole,
    myAssignment,
    currentRound: round,
    submitted,
    submissionStatus,
    revealData,
    events,
    scores,
    isGameMaster,
  })
}
