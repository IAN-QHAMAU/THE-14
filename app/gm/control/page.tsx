'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { subscribeToGame, subscribeToPlayers, subscribeToActions, subscribeToEvents } from '@/lib/realtime/subscriptions'
import { Button } from '@/components/ui/Button'
import { Countdown } from '@/components/ui/Countdown'
import { formatTime } from '@/lib/utils'
import type { Game, Player, Round, GameEvent } from '@/types'

interface GMState {
  game: Game
  players: Player[]
  currentRound: Round | null
  submissionStatus: Record<string, boolean>
  events: GameEvent[]
  isGameMaster: boolean
}

export default function GMControlPage() {
  const router = useRouter()
  const [state, setState] = useState<GMState | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchState = useCallback(async () => {
    const res = await fetch('/api/game/state')
    if (res.status === 401) { router.push('/gm'); return }
    const data = await res.json()
    if (!data.isGameMaster) { router.push('/room'); return }
    setState(data)
  }, [router])

  useEffect(() => { fetchState() }, [fetchState])

  useEffect(() => {
    if (!state?.game?.id) return
    const gid = state.game.id
    const rid = state.currentRound?.id

    const subs = [
      subscribeToGame(gid, () => fetchState()),
      subscribeToPlayers(gid, () => fetchState()),
      subscribeToEvents(gid, () => fetchState()),
      ...(rid ? [subscribeToActions(rid, () => fetchState())] : []),
    ]
    return () => subs.forEach((s) => supabase.removeChannel(s))
  }, [state?.game?.id, state?.currentRound?.id, fetchState])

  async function control(action: string) {
    setLoading(action)
    setError('')
    try {
      const res = await fetch('/api/round/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Action failed.'); return }
      await fetchState()
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(null)
    }
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-xs text-stone-400 tracking-widest animate-pulse">Loading…</p>
      </main>
    )
  }

  const { game, players, currentRound, submissionStatus, events } = state
  const realPlayers = players.filter((p) => !p.is_game_master)
  const submittedCount = Object.values(submissionStatus).filter(Boolean).length

  const statusColor: Record<string, string> = {
    waiting: 'text-stone-400',
    briefing: 'text-amber-600',
    active: 'text-green-700',
    revealing: 'text-blue-600',
    finished: 'text-stone-400',
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-stone-900">THE 14</h1>
            <p className="text-xs text-stone-400 tracking-widest uppercase mt-0.5">Game Master</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg tracking-widest text-stone-700">{game.game_code}</p>
            <p className={`text-xs tracking-widest uppercase mt-0.5 ${statusColor[game.status] ?? 'text-stone-400'}`}>
              {game.status}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Players', value: `${realPlayers.length} / ${game.max_players}` },
            { label: 'Round', value: currentRound ? `${currentRound.round_number} of 3` : '—' },
            { label: 'Submitted', value: currentRound ? `${submittedCount} / ${realPlayers.length}` : '—' },
          ].map((s) => (
            <div key={s.label} className="border border-stone-200 p-3 bg-white text-center">
              <p className="text-xs text-stone-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-lg font-light text-stone-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Round info */}
        {currentRound && (
          <div className="border border-stone-200 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest">Current Round</p>
                <p className="text-sm font-medium text-stone-800 mt-0.5">{currentRound.title}</p>
              </div>
              {currentRound.ends_at && currentRound.status === 'active' && (
                <Countdown endsAt={currentRound.ends_at} />
              )}
            </div>
            <p className="text-xs text-stone-400">
              Status:{' '}
              <span className="text-stone-600 font-medium">{currentRound.status}</span>
            </p>
          </div>
        )}

        {/* Player activity */}
        <div className="space-y-2">
          <p className="text-xs text-stone-400 uppercase tracking-widest">Player Activity</p>
          <div className="space-y-px">
            {realPlayers.map((p) => {
              const submitted = submissionStatus[p.id] ?? false
              return (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 bg-white border border-stone-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        p.is_connected ? 'bg-green-500' : 'bg-stone-300'
                      }`}
                    />
                    <span className="text-sm text-stone-700">{p.name}</span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      submitted ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {submitted ? 'submitted' : 'thinking'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <p className="text-xs text-stone-400 uppercase tracking-widest">Controls</p>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-2">
            {game.status === 'waiting' && (
              <Button
                variant="primary"
                className="col-span-2"
                loading={loading === 'start_game'}
                onClick={() => control('start_game')}
              >
                START GAME
              </Button>
            )}
            {(game.status === 'active' || game.status === 'briefing') && (
              <Button
                loading={loading === 'start_round'}
                onClick={() => control('start_round')}
              >
                START ROUND
              </Button>
            )}
            {currentRound?.status === 'active' && (
              <Button
                variant="secondary"
                loading={loading === 'lock_round'}
                onClick={() => control('lock_round')}
              >
                LOCK ROUND
              </Button>
            )}
            {(currentRound?.status === 'locked' || currentRound?.status === 'active') && (
              <Button
                loading={loading === 'reveal'}
                onClick={() => control('reveal')}
              >
                REVEAL
              </Button>
            )}
            {currentRound?.status === 'revealing' && (
              <Button
                loading={loading === 'next_round'}
                onClick={() => control('next_round')}
              >
                NEXT ROUND
              </Button>
            )}
            {game.status === 'active' && (
              <Button
                variant="secondary"
                loading={loading === 'trigger_event'}
                onClick={() => control('trigger_event')}
              >
                TRIGGER EVENT
              </Button>
            )}
            {game.status !== 'finished' && game.status !== 'waiting' && (
              <Button
                variant="ghost"
                loading={loading === 'pause_game'}
                onClick={() => control('pause_game')}
                className="text-stone-500"
              >
                PAUSE
              </Button>
            )}
          </div>
        </div>

        {/* Event log */}
        {events.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Live Events</p>
            <div className="space-y-px max-h-48 overflow-y-auto">
              {events.slice(0, 15).map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 py-2 px-3 bg-white border border-stone-100">
                  <span className="text-xs text-stone-400 font-mono flex-shrink-0">
                    {formatTime(ev.created_at)}
                  </span>
                  <span className="text-xs text-stone-600">{ev.event_type.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
