'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { subscribeToGame, subscribeToPlayers, subscribeToActions, subscribeToEvents } from '@/lib/realtime/subscriptions'
import { Button } from '@/components/ui/Button'
import { Countdown } from '@/components/ui/Countdown'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { CATEGORIES, type Category } from '@/lib/game/questions'
import { formatTime } from '@/lib/utils'
import type { Game, Player, Round, GameEvent } from '@/types'

interface GMState {
  game: Game
  players: Player[]
  currentRound: Round | null
  submissionStatus: Record<string, boolean>
  events: GameEvent[]
  scores: { player_id: string; name: string; avatar: string; total: number }[]
  isGameMaster: boolean
}

const CATEGORY_OPTIONS = Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]

export default function GMControlPage() {
  const router = useRouter()
  const [state, setState] = useState<GMState | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('general')
  const [questionCount, setQuestionCount] = useState(10)

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

  async function control(action: string, extra?: Record<string, unknown>) {
    setLoading(action)
    setError('')
    try {
      const res = await fetch('/api/round/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
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

  const { game, players, currentRound, submissionStatus, events, scores } = state
  const realPlayers = players.filter((p) => !p.is_game_master)
  const submittedCount = Object.values(submissionStatus).filter(Boolean).length
  const catInfo = game.category ? CATEGORIES[game.category] : null

  const statusColors: Record<string, string> = {
    waiting: 'text-stone-400',
    category: 'text-amber-600',
    active: 'text-green-700',
    question_result: 'text-blue-600',
    finished: 'text-stone-400',
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-stone-900">THE 14</h1>
            <p className="text-xs text-stone-400 tracking-widest uppercase mt-0.5">Game Master</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg tracking-widest text-stone-700">{game.game_code}</p>
            <p className={`text-xs tracking-widest uppercase mt-0.5 ${statusColors[game.status] ?? 'text-stone-400'}`}>
              {game.status.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Players', value: `${realPlayers.length} / ${game.max_players}` },
            { label: 'Question', value: game.status !== 'waiting' ? `${game.current_round} / ${game.total_questions || '?'}` : '—' },
            { label: 'Answered', value: currentRound ? `${submittedCount} / ${realPlayers.length}` : '—' },
          ].map((s) => (
            <div key={s.label} className="border border-stone-200 p-3 bg-white text-center">
              <p className="text-xs text-stone-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-lg font-light text-stone-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active question info */}
        {currentRound && catInfo && (
          <div className="border border-stone-200 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{catInfo.emoji}</span>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest">Current Question</p>
                  <p className="text-sm font-medium text-stone-800 mt-0.5 line-clamp-1">
                    {currentRound.description}
                  </p>
                </div>
              </div>
              {currentRound.ends_at && currentRound.status === 'active' && (
                <Countdown endsAt={currentRound.ends_at} />
              )}
            </div>
          </div>
        )}

        {/* Player list */}
        <div className="space-y-1.5">
          <p className="text-xs text-stone-400 uppercase tracking-widest">Players</p>
          <div className="space-y-px">
            {realPlayers.map((p) => {
              const answered = submissionStatus[p.id] ?? false
              const scoreEntry = scores.find((s) => s.player_id === p.id)
              return (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 bg-white border border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.is_connected ? 'bg-green-500' : 'bg-stone-300'}`} />
                    <AvatarDisplay avatarId={p.avatar} size="sm" />
                    <span className="text-sm text-stone-700">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${answered ? 'text-stone-900' : 'text-stone-300'}`}>
                      {answered ? '✓' : '…'}
                    </span>
                    <span className="text-xs font-mono text-stone-500">{scoreEntry?.total ?? 0}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <p className="text-xs text-stone-400 uppercase tracking-widest">Controls</p>
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Setup — waiting state */}
          {game.status === 'waiting' && (
            <div className="space-y-3 p-4 border border-stone-200 bg-white">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`p-3 border-2 text-left flex items-center gap-2 transition-all ${
                        selectedCategory === key
                          ? 'border-stone-900 bg-stone-900 text-stone-50'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">
                  Questions: {questionCount}
                </p>
                <input
                  type="range"
                  min={5}
                  max={CATEGORIES[selectedCategory].questionCount}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>5</span>
                  <span>{CATEGORIES[selectedCategory].questionCount}</span>
                </div>
              </div>

              <Button
                size="lg"
                loading={loading === 'start_game'}
                onClick={() => control('start_game', { category: selectedCategory, questionCount })}
                disabled={realPlayers.length < 1}
              >
                START GAME
              </Button>
              {realPlayers.length < 1 && (
                <p className="text-xs text-stone-400 text-center">Need at least 1 player to start.</p>
              )}
            </div>
          )}

          {/* Quiz controls */}
          {game.status !== 'waiting' && game.status !== 'finished' && (
            <div className="grid grid-cols-2 gap-2">
              {(game.status === 'category') && (
                <Button
                  className="col-span-2"
                  loading={loading === 'next_question'}
                  onClick={() => control('next_question')}
                >
                  ▶ NEXT QUESTION
                </Button>
              )}

              {currentRound?.status === 'active' && (
                <Button
                  loading={loading === 'lock_question'}
                  onClick={() => control('lock_question')}
                >
                  LOCK &amp; REVEAL
                </Button>
              )}

              {game.status === 'question_result' && (
                <Button
                  className="col-span-2"
                  loading={loading === 'next_round'}
                  onClick={() => control('next_round')}
                >
                  CONTINUE →
                </Button>
              )}

              {game.status !== 'waiting' && (
                <Button
                  variant="danger"
                  loading={loading === 'end_game'}
                  onClick={() => control('end_game')}
                >
                  END GAME
                </Button>
              )}
            </div>
          )}

          {game.status === 'finished' && (
            <div className="p-4 bg-stone-900 text-stone-50 text-center">
              <p className="text-sm font-medium">Game over.</p>
              <p className="text-xs text-stone-400 mt-1">Players are seeing the final leaderboard.</p>
            </div>
          )}
        </div>

        {/* Live leaderboard during game */}
        {scores.length > 0 && game.status !== 'waiting' && (
          <div className="space-y-1.5">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Live Scores</p>
            <div className="space-y-px">
              {[...scores].sort((a, b) => b.total - a.total).map((s, i) => (
                <div key={s.player_id} className="flex items-center justify-between py-2 px-3 bg-white border border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 w-4">{i + 1}</span>
                    <AvatarDisplay avatarId={s.avatar} size="sm" />
                    <span className="text-sm text-stone-700">{s.name}</span>
                  </div>
                  <span className="font-mono text-sm text-stone-700">{s.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event log */}
        {events.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Event Log</p>
            <div className="space-y-px max-h-40 overflow-y-auto">
              {events.slice(0, 12).map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 py-2 px-3 bg-white border border-stone-100">
                  <span className="text-xs text-stone-400 font-mono flex-shrink-0">{formatTime(ev.created_at)}</span>
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
