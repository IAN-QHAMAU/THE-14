'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { subscribeToGame, subscribeToPlayers, subscribeToRounds, subscribeToEvents } from '@/lib/realtime/subscriptions'
import { WaitingRoom } from '@/components/game/WaitingRoom'
import { CategoryReveal } from '@/components/game/CategoryReveal'
import { QuestionScreen } from '@/components/game/QuestionScreen'
import { QuestionResult } from '@/components/game/QuestionResult'
import { Podium } from '@/components/game/Podium'
import type { Game, Player, Round, GameEvent, AnswerStat, PlayerScoreEntry } from '@/types'
import type { Question } from '@/lib/game/questions'

interface StateData {
  game: Game
  players: Player[]
  myPlayer: Player | null
  currentRound: Round | null
  currentQuestion: (Question & { correct: number }) | null
  submitted: boolean
  selectedOption: number | null
  revealData: { correct_index: number; answer_stats: AnswerStat[] } | null
  scores: PlayerScoreEntry[]
  myRank: number
  myScore: number
  events: GameEvent[]
  isGameMaster: boolean
}

export default function RoomPage() {
  const router = useRouter()
  const [state, setState] = useState<StateData | null>(null)
  const [error, setError] = useState('')
  const questionStartRef = useRef<number>(Date.now())

  const fetchState = useCallback(async () => {
    const res = await fetch('/api/game/state')
    if (res.status === 401) { router.push('/join'); return }
    if (!res.ok) { setError('Could not load game.'); return }
    const data = await res.json()
    setState(data)
  }, [router])

  useEffect(() => { fetchState() }, [fetchState])

  // Track when question changes to measure response time
  useEffect(() => {
    if (state?.currentRound?.status === 'active') {
      questionStartRef.current = Date.now()
    }
  }, [state?.currentRound?.id, state?.currentRound?.status])

  useEffect(() => {
    if (!state?.game?.id) return
    const gid = state.game.id

    const subs = [
      subscribeToGame(gid, () => fetchState()),
      subscribeToPlayers(gid, () => fetchState()),
      subscribeToRounds(gid, () => fetchState()),
      subscribeToEvents(gid, () => fetchState()),
    ]
    return () => subs.forEach((s) => supabase.removeChannel(s))
  }, [state?.game?.id, fetchState])

  async function handleAnswer(optionIndex: number) {
    const timeTakenMs = Date.now() - questionStartRef.current
    const res = await fetch('/api/action/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIndex, timeTakenMs }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? 'Submit failed')
    }
    await fetchState()
  }

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-stone-600">{error}</p>
          <button onClick={() => router.push('/join')} className="text-sm underline text-stone-500">
            Back to join
          </button>
        </div>
      </main>
    )
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-xs text-stone-400 tracking-widest uppercase animate-pulse">Loading…</p>
      </main>
    )
  }

  const {
    game, players, myPlayer, currentRound, currentQuestion,
    submitted, selectedOption, revealData, scores, myRank, myScore,
  } = state

  // Redirect GM
  if (state.isGameMaster) {
    router.push('/gm/control')
    return null
  }

  // ── State machine ──────────────────────────────────────────────

  if (game.status === 'waiting') {
    return <WaitingRoom game={game} players={players} myPlayer={myPlayer} />
  }

  if (game.status === 'finished') {
    return <Podium scores={scores} myPlayerId={myPlayer?.id ?? ''} />
  }

  if (game.status === 'question_result' && currentQuestion && revealData) {
    const answerStats: AnswerStat[] = revealData.answer_stats ?? []
    return (
      <QuestionResult
        question={{ ...currentQuestion, correct: revealData.correct_index }}
        selectedOption={selectedOption}
        pointsEarned={0}
        answerStats={answerStats}
        myRank={myRank}
        totalPlayers={players.filter((p) => !p.is_game_master).length}
        myScore={myScore}
      />
    )
  }

  if (game.status === 'active' && currentRound?.status === 'active' && currentQuestion) {
    return (
      <QuestionScreen
        question={currentQuestion}
        questionNumber={currentRound.round_number}
        totalQuestions={game.total_questions}
        submitted={submitted}
        selectedOption={selectedOption}
        endsAt={currentRound.ends_at ?? new Date(Date.now() + 20000).toISOString()}
        onAnswer={handleAnswer}
      />
    )
  }

  // Category reveal / between questions
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      {game.category ? (
        <CategoryReveal
          category={game.category}
          totalQuestions={game.total_questions}
        />
      ) : (
        <div className="text-center space-y-2">
          <p className="text-sm text-stone-500">Waiting for the game to begin…</p>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
        </div>
      )}
    </main>
  )
}
