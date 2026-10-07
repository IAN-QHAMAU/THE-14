'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { subscribeToGame, subscribeToPlayers, subscribeToRounds, subscribeToEvents } from '@/lib/realtime/subscriptions'
import { WaitingRoom } from '@/components/game/WaitingRoom'
import { Briefing } from '@/components/game/Briefing'
import { RoundActive } from '@/components/game/RoundActive'
import { RoundReveal } from '@/components/game/RoundReveal'
import { FinalResults } from '@/components/game/FinalResults'
import { LiveEvent } from '@/components/game/LiveEvent'
import type { Game, Player, Round, PlayerRole, RoundAssignment, GameEvent } from '@/types'

interface StateData {
  game: Game
  players: Player[]
  myPlayer: Player | null
  myRole: PlayerRole | null
  myAssignment: RoundAssignment | null
  currentRound: Round | null
  submitted: boolean
  revealData: { teamA: number; teamB: number; submissionCount: number } | null
  events: GameEvent[]
  scores: { player_id: string; name: string; total: number }[]
  isGameMaster: boolean
}

export default function RoomPage() {
  const router = useRouter()
  const [state, setState] = useState<StateData | null>(null)
  const [briefingDone, setBriefingDone] = useState(false)
  const [latestEvent, setLatestEvent] = useState<GameEvent | null>(null)
  const [error, setError] = useState('')

  const fetchState = useCallback(async () => {
    const res = await fetch('/api/game/state')
    if (res.status === 401) { router.push('/join'); return }
    if (!res.ok) { setError('Could not load game.'); return }
    const data = await res.json()
    setState(data)
  }, [router])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  useEffect(() => {
    if (!state?.game?.id) return
    const gameId = state.game.id

    const gameSub = subscribeToGame(gameId, () => fetchState())
    const playerSub = subscribeToPlayers(gameId, () => fetchState())
    const roundSub = subscribeToRounds(gameId, () => fetchState())
    const eventSub = subscribeToEvents(gameId, (ev) => {
      setLatestEvent(ev)
      fetchState()
    })

    return () => {
      supabase.removeChannel(gameSub)
      supabase.removeChannel(playerSub)
      supabase.removeChannel(roundSub)
      supabase.removeChannel(eventSub)
    }
  }, [state?.game?.id, fetchState])

  async function handleSubmit(payload: Record<string, unknown>) {
    const res = await fetch('/api/action/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType: 'choice', payload }),
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

  const { game, players, myPlayer, myRole, myAssignment, currentRound, submitted, revealData, scores } = state

  // Route GM to their interface
  if (state.isGameMaster) {
    router.push('/gm/control')
    return null
  }

  // State machine rendering
  if (game.status === 'waiting') {
    return <WaitingRoom game={game} players={players} myPlayer={myPlayer} />
  }

  if (game.status === 'briefing' && myRole && !briefingDone) {
    return <Briefing role={myRole} onReady={() => setBriefingDone(true)} />
  }

  if (game.status === 'finished') {
    return (
      <FinalResults
        scores={scores}
        myPlayerId={myPlayer?.id ?? ''}
        myRole={myRole}
      />
    )
  }

  if (currentRound?.status === 'revealing' || currentRound?.status === 'complete') {
    return (
      <>
        <RoundReveal round={currentRound} revealData={revealData} assignment={myAssignment} />
        <LiveEvent event={latestEvent} />
      </>
    )
  }

  if (currentRound?.status === 'active') {
    return (
      <>
        <RoundActive
          round={currentRound}
          assignment={myAssignment}
          submitted={submitted}
          onSubmit={handleSubmit}
        />
        <LiveEvent event={latestEvent} />
      </>
    )
  }

  // Briefing done, waiting for round to start
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center space-y-3 max-w-xs">
        <p className="text-sm font-medium text-stone-700">
          {currentRound?.status === 'briefing' || currentRound?.status === 'locked'
            ? 'Round in progress. Hold tight.'
            : 'Waiting for the next round.'}
        </p>
        {currentRound && (
          <p className="text-xs text-stone-400">
            Round {currentRound.round_number} — {currentRound.title}
          </p>
        )}
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
      </div>
    </main>
  )
}
