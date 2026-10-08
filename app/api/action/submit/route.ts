import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServerSupabase } from '@/lib/db/supabase'
import { hasPlayerAnswered, getCurrentRound } from '@/lib/db/queries'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.isGameMaster) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
  }

  const { optionIndex, timeTakenMs } = await req.json()
  const { playerId, gameId } = session
  const db = createServerSupabase()

  // Validate
  if (optionIndex === undefined || optionIndex < 0 || optionIndex > 3) {
    return NextResponse.json({ error: 'Invalid answer.' }, { status: 400 })
  }

  const round = await getCurrentRound(gameId)
  if (!round || round.status !== 'active') {
    return NextResponse.json({ error: 'No active question.' }, { status: 400 })
  }

  const alreadyAnswered = await hasPlayerAnswered(round.id, playerId)
  if (alreadyAnswered) {
    return NextResponse.json({ error: 'Already answered.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await db.from('actions').insert({
    round_id: round.id,
    player_id: playerId,
    action_type: 'answer',
    payload: {
      option_index: Number(optionIndex),
      answered_at: now,
      time_taken_ms: Math.max(0, Number(timeTakenMs) || 0),
    },
  })

  if (error) {
    return NextResponse.json({ error: 'Could not submit answer.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
