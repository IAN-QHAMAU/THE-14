import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getGameById, getCurrentRound, getPlayers } from '@/lib/db/queries'
import {
  setupGame,
  startNextQuestion,
  startBluffVoting,
  lockAndRevealQuestion,
  showLeaderboard,
  hasPendingRounds,
  finishGame,
  resetGame,
} from '@/lib/game/stateMachine'
import {
  ALL_TYPES,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  PICKABLE_CATEGORIES,
  TIMER_OPTIONS,
  type Category,
  type GameSettings,
  type QuestionType,
} from '@/lib/game/questions'

function parseSettings(raw: unknown): GameSettings | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const categories = (Array.isArray(r.categories) ? r.categories : []).filter((c): c is Category =>
    PICKABLE_CATEGORIES.includes(c as Category),
  )
  const types = (Array.isArray(r.types) ? r.types : []).filter((t): t is QuestionType =>
    ALL_TYPES.includes(t as QuestionType),
  )
  if (!types.length) return null
  const timer = TIMER_OPTIONS.includes(Number(r.timer)) ? Number(r.timer) : 20
  const questionCount = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Number(r.questionCount) || 10))
  return { categories: [...new Set(categories)], types: [...new Set(types)], timer, questionCount }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.isGameMaster) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
  }

  const body = await req.json()
  const { action } = body
  const { gameId } = session

  const game = await getGameById(gameId)
  if (!game) return NextResponse.json({ error: 'Game not found.' }, { status: 404 })

  switch (action) {
    case 'start_game': {
      if (game.status !== 'waiting') {
        return NextResponse.json({ error: 'Game already started.' }, { status: 400 })
      }
      const settings = parseSettings(body.settings)
      if (!settings) return NextResponse.json({ error: 'Pick at least one game type.' }, { status: 400 })
      const { error } = await setupGame(gameId, settings)
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    case 'next_question': {
      if (!['category', 'question_result', 'leaderboard'].includes(game.status)) {
        return NextResponse.json({ error: 'Finish the current question first.' }, { status: 400 })
      }
      if (!(await hasPendingRounds(gameId))) {
        await finishGame(gameId)
        return NextResponse.json({ success: true, finished: true })
      }
      const players = await getPlayers(gameId)
      const round = await startNextQuestion(game, players)
      // Another host screen or a double tap already moved on: nothing to do.
      if (round === 'busy') return NextResponse.json({ success: true, skipped: true })
      if (!round) return NextResponse.json({ error: 'Could not start the next question.' }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    case 'start_voting': {
      const round = await getCurrentRound(gameId)
      if (!round || round.status !== 'active') {
        return NextResponse.json({ error: 'No question in progress.' }, { status: 400 })
      }
      const { error } = await startBluffVoting(game, round)
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    case 'lock_question': {
      const round = await getCurrentRound(gameId)
      if (!round || !['active', 'voting'].includes(round.status)) {
        return NextResponse.json({ error: 'No question in progress.' }, { status: 400 })
      }
      if (round.data?.phase === 'write') {
        return NextResponse.json({ error: 'Start voting first.' }, { status: 400 })
      }
      const { error } = await lockAndRevealQuestion(gameId, round)
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    case 'show_leaderboard': {
      if (game.status !== 'question_result') {
        return NextResponse.json({ error: 'Reveal the answer first.' }, { status: 400 })
      }
      await showLeaderboard(gameId)
      return NextResponse.json({ success: true })
    }

    case 'end_game': {
      if (game.status === 'waiting' || game.status === 'finished') {
        return NextResponse.json({ error: 'Nothing to end.' }, { status: 400 })
      }
      await finishGame(gameId)
      return NextResponse.json({ success: true })
    }

    case 'play_again': {
      await resetGame(gameId)
      return NextResponse.json({ success: true })
    }

    default:
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  }
}
