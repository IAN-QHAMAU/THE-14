import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServerSupabase } from '@/lib/db/supabase'
import { hasPlayerSubmitted, getCurrentRound } from '@/lib/db/queries'
import { logEvent } from '@/lib/game/stateMachine'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.isGameMaster) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
  }

  const { actionType, payload } = await req.json()
  const { playerId, gameId } = session
  const db = createServerSupabase()

  const round = await getCurrentRound(gameId)
  if (!round || round.status !== 'active') {
    return NextResponse.json({ error: 'No active round.' }, { status: 400 })
  }

  const alreadySubmitted = await hasPlayerSubmitted(round.id, playerId)
  if (alreadySubmitted) {
    return NextResponse.json({ error: 'Already submitted.' }, { status: 400 })
  }

  // Validate payload
  if (!actionType || !payload) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  // For split actions, validate the numbers add up
  if (actionType === 'choice' && payload.teamA !== undefined) {
    const a = Number(payload.teamA)
    const b = Number(payload.teamB)
    if (isNaN(a) || isNaN(b) || a + b !== 1000 || a < 0 || b < 0) {
      return NextResponse.json({ error: 'Split must total 1000.' }, { status: 400 })
    }
  }

  const { error } = await db.from('actions').insert({
    round_id: round.id,
    player_id: playerId,
    action_type: actionType,
    payload,
  })

  if (error) {
    return NextResponse.json({ error: 'Could not submit action.' }, { status: 500 })
  }

  await logEvent(gameId, round.id, 'vote_cast', playerId, null, { action_type: actionType })

  return NextResponse.json({ success: true })
}
