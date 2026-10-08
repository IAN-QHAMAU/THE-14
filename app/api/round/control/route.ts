import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getGameById, getCurrentRound } from '@/lib/db/queries'
import {
  setupGame,
  startNextQuestion,
  lockAndRevealQuestion,
  completeQuestion,
} from '@/lib/game/stateMachine'
import { createServerSupabase } from '@/lib/db/supabase'
import type { Category } from '@/lib/game/questions'
import type { GameStatus } from '@/types'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.isGameMaster) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
  }

  const body = await req.json()
  const { action, category, questionCount } = body
  const { gameId } = session
  const db = createServerSupabase()

  const game = await getGameById(gameId)
  if (!game) return NextResponse.json({ error: 'Game not found.' }, { status: 404 })

  switch (action) {
    case 'start_game': {
      if (!category) {
        return NextResponse.json({ error: 'Category required.' }, { status: 400 })
      }
      const count = Math.min(25, Math.max(5, Number(questionCount) || 10))
      await setupGame(gameId, category as Category, count)
      return NextResponse.json({ success: true })
    }

    case 'next_question': {
      const round = await startNextQuestion(gameId)
      if (!round) {
        return NextResponse.json({ error: 'No more questions.' }, { status: 400 })
      }
      return NextResponse.json({ success: true, roundId: round.id })
    }

    case 'lock_question': {
      const round = await getCurrentRound(gameId)
      if (!round || round.status !== 'active') {
        return NextResponse.json({ error: 'No active question.' }, { status: 400 })
      }
      const result = await lockAndRevealQuestion(round.id, gameId)
      return NextResponse.json({ success: true, ...result })
    }

    case 'next_round': {
      const round = await getCurrentRound(gameId)
      if (!round) {
        return NextResponse.json({ error: 'No current round.' }, { status: 400 })
      }
      const result = await completeQuestion(round.id, gameId)
      return NextResponse.json({ success: true, result })
    }

    case 'end_game': {
      await db.from('games').update({
        status: 'finished' as GameStatus,
        ended_at: new Date().toISOString(),
      }).eq('id', gameId)
      return NextResponse.json({ success: true })
    }

    case 'pause_game': {
      await db.from('games').update({ status: 'waiting' as GameStatus }).eq('id', gameId)
      return NextResponse.json({ success: true })
    }

    default:
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  }
}
