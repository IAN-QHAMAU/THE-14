'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/Button'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { HostStage } from '@/components/gm/HostStage'
import { DEFAULT_SETTINGS, GameSetup, poolSize } from '@/components/gm/GameSetup'
import { ReactionLayer, useReactions } from '@/components/game/Reactions'
import { serverNow } from '@/lib/clock'
import { sound } from '@/lib/sound'
import { MIN_QUESTIONS, PICKABLE_CATEGORIES, ALL_TYPES, type GameSettings } from '@/lib/game/questions'
import { formatTime, cn } from '@/lib/utils'

const SETTINGS_KEY = 'the14_gm_settings'
const AUTO_KEY = 'the14_gm_auto'

function loadSettings(): GameSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const s = JSON.parse(raw) as GameSettings
    return {
      categories: (s.categories ?? []).filter((c) => PICKABLE_CATEGORIES.includes(c)),
      types: (s.types ?? []).filter((t) => ALL_TYPES.includes(t)),
      timer: s.timer ?? 20,
      questionCount: s.questionCount ?? 12,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

const STATUS_LABEL: Record<string, string> = {
  waiting: 'Lobby',
  category: 'Intro',
  active: 'Live',
  question_result: 'Reveal',
  leaderboard: 'Standings',
  finished: 'Finished',
}

export default function GMControlPage() {
  const router = useRouter()
  const toGm = useCallback(() => router.push('/gm'), [router])
  const { state, error: loadError, refresh } = useGameState({ onUnauthorized: toGm, watchActions: true })
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [auto, setAuto] = useState(true)
  const [joinUrl, setJoinUrl] = useState('/join')
  const [panelOpen, setPanelOpen] = useState(false)
  const autoFired = useRef<string | null>(null)

  const { items } = useReactions(state?.game.id)

  useEffect(() => {
    setSettings(loadSettings())
    try {
      setAuto(window.localStorage.getItem(AUTO_KEY) !== '0')
    } catch {
      // Keep the default.
    }
    setJoinUrl(`${window.location.host}/join`)
  }, [])

  const updateSettings = (s: GameSettings) => {
    setSettings(s)
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    } catch {
      // Storage blocked, fine.
    }
  }

  const toggleAuto = () => {
    setAuto((a) => {
      try {
        window.localStorage.setItem(AUTO_KEY, a ? '0' : '1')
      } catch {
        // Storage blocked, fine.
      }
      return !a
    })
  }

  const control = useCallback(
    async (action: string, extra?: Record<string, unknown>, quiet = false) => {
      sound.unlock()
      setLoading(action)
      if (!quiet) setError('')
      try {
        const res = await fetch('/api/round/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...extra }),
        })
        const data = await res.json()
        if (!res.ok && !quiet) setError(data.error ?? 'Action failed.')
        await refresh()
      } catch {
        if (!quiet) setError('Connection error.')
      } finally {
        setLoading(null)
      }
    },
    [refresh],
  )

  if (state && !state.isGameMaster) router.push('/room')

  const round = state?.currentRound
  const phase = round?.data?.phase
  const realPlayers = useMemo(() => (state?.players ?? []).filter((p) => !p.is_game_master), [state?.players])

  // Auto reveal: when everyone has answered, or the timer runs out.
  useEffect(() => {
    if (!auto || !state || state.game.status !== 'active' || !round || !round.ends_at) return
    if (!['active', 'voting'].includes(round.status)) return
    const key = `${round.id}:${round.status}:${phase ?? ''}`
    if (autoFired.current === key) return
    const allIn = realPlayers.length > 0 && state.answeredCount >= realPlayers.length
    const started = round.starts_at ? serverNow() >= Date.parse(round.starts_at) : true
    const delay = allIn && started ? 1200 : Math.max(0, Date.parse(round.ends_at) - serverNow() + 800)
    const action = phase === 'write' ? 'start_voting' : 'lock_question'
    const t = setTimeout(() => {
      autoFired.current = key
      void control(action, undefined, true)
    }, delay)
    return () => clearTimeout(t)
  }, [auto, state, round, phase, realPlayers.length, control])

  if (!state) {
    return (
      <main className="min-h-[100dvh] bg-stone-900 flex items-center justify-center">
        <p className="text-xs text-stone-500 tracking-widest uppercase animate-pulse">{loadError || 'Loading'}</p>
      </main>
    )
  }

  const { game, events } = state
  const isLast = game.current_round >= game.total_questions
  const pool = poolSize(settings)
  const canStart = realPlayers.length > 0 && pool >= MIN_QUESTIONS && settings.types.length > 0

  // ── Control bar actions ──────────────────────────────────────────────────
  let primary: { label: string; action: string; extra?: Record<string, unknown>; disabled?: boolean } | null = null
  let secondary: { label: string; action: string } | null = null

  switch (game.status) {
    case 'waiting':
      primary = {
        label: realPlayers.length === 0 ? 'Waiting for players' : 'Start game',
        action: 'start_game',
        extra: { settings: { ...settings, questionCount: Math.min(settings.questionCount, pool) } },
        disabled: !canStart,
      }
      break
    case 'category':
      primary = { label: 'Start question 1', action: 'next_question' }
      break
    case 'active':
      primary = phase === 'write' ? { label: 'Start voting', action: 'start_voting' } : { label: 'Reveal answer', action: 'lock_question' }
      break
    case 'question_result':
      primary = { label: isLast ? 'Final results' : 'Next question', action: 'next_question' }
      secondary = { label: 'Standings', action: 'show_leaderboard' }
      break
    case 'leaderboard':
      primary = { label: isLast ? 'Final results' : 'Next question', action: 'next_question' }
      break
    case 'finished':
      primary = { label: 'Play again', action: 'play_again' }
      break
  }

  const playerPanel = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500 uppercase tracking-widest">Players</p>
        <span className="text-xs font-mono text-stone-500">
          {realPlayers.length} / {game.max_players}
        </span>
      </div>
      <div className="space-y-1">
        {[...realPlayers]
          .sort((a, b) => b.score - a.score)
          .map((p) => {
            const answered = state.submissionStatus[p.id]
            return (
              <div key={p.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl bg-stone-800/60">
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', p.is_connected ? 'bg-emerald-500' : 'bg-stone-600')} />
                <AvatarDisplay avatarId={p.avatar} size="xs" />
                <span className="text-sm text-stone-200 flex-1 truncate">
                  {p.name}
                  {p.streak >= 3 && <span className="ml-1.5 text-xs text-stone-400">🔥{p.streak}</span>}
                </span>
                {game.status === 'active' && (
                  <span className={cn('text-xs', answered ? 'text-emerald-400' : 'text-stone-600')}>{answered ? '✓' : '…'}</span>
                )}
                <span className="text-xs font-mono text-stone-400 w-12 text-right">{p.score}</span>
              </div>
            )
          })}
        {realPlayers.length === 0 && <p className="text-sm text-stone-500 py-2">No one has joined yet.</p>}
      </div>
    </div>
  )

  return (
    <main className="min-h-[100dvh] bg-stone-900 text-stone-50 flex flex-col">
      <ReactionLayer items={items} showNames />

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-stone-800">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-medium">THE 14</h1>
          <span className="text-xs text-stone-500 uppercase tracking-widest">{STATUS_LABEL[game.status] ?? game.status}</span>
        </div>
        <div className="flex items-center gap-3">
          {game.status !== 'waiting' && <span className="font-mono text-sm tracking-widest text-stone-400">{game.game_code}</span>}
          <SoundToggle dark />
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            className="lg:hidden text-xs text-stone-400 rounded-full border border-stone-700 px-3 py-1"
          >
            {panelOpen ? 'Hide players' : `Players ${realPlayers.length}`}
          </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-[1fr_340px]">
        {/* Stage */}
        <section className="px-4 md:px-10 py-8 md:py-12 flex flex-col items-center justify-center min-h-[50vh]">
          <HostStage state={state} joinUrl={joinUrl} />
        </section>

        {/* Side panel */}
        <aside className={cn('border-t lg:border-t-0 lg:border-l border-stone-800 px-4 py-6 space-y-8 lg:block', panelOpen || game.status === 'waiting' ? 'block' : 'hidden')}>
          {game.status === 'waiting' ? (
            <>
              <GameSetup settings={settings} onChange={updateSettings} />
              {playerPanel}
            </>
          ) : (
            <>
              {playerPanel}
              {events.length > 0 && (
                <details className="group">
                  <summary className="text-xs text-stone-500 uppercase tracking-widest cursor-pointer select-none">Event log</summary>
                  <div className="space-y-1 mt-2 max-h-48 overflow-y-auto">
                    {events.slice(0, 15).map((ev) => (
                      <div key={ev.id} className="flex gap-3 py-1.5 px-2 text-xs">
                        <span className="text-stone-500 font-mono flex-shrink-0">{formatTime(ev.created_at)}</span>
                        <span className="text-stone-400">{ev.event_type.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </aside>
      </div>

      {/* Control bar */}
      <footer className="sticky bottom-0 border-t border-stone-800 bg-stone-900/95 backdrop-blur px-4 md:px-8 py-3 safe-bottom">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          {(game.status === 'active' || game.status === 'question_result' || game.status === 'leaderboard' || game.status === 'category') && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('End the game now and show the podium?')) void control('end_game')
              }}
              className="text-xs text-stone-500 hover:text-rose-400 px-2 py-2"
            >
              End game
            </button>
          )}
          {game.status === 'active' && (
            <button type="button" onClick={toggleAuto} className="flex items-center gap-2 text-xs text-stone-400 px-2 py-2" aria-pressed={auto}>
              <span className={cn('w-7 h-4 rounded-full relative transition-colors', auto ? 'bg-emerald-600' : 'bg-stone-700')}>
                <span className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', auto ? 'left-3.5' : 'left-0.5')} />
              </span>
              Auto reveal
            </button>
          )}
          <div className="flex-1 text-right text-sm text-rose-400 truncate">{error}</div>
          {secondary && (
            <Button
              variant="secondary"
              className="bg-transparent border-stone-700 text-stone-200 hover:bg-stone-800"
              loading={loading === secondary.action}
              onClick={() => void control(secondary!.action)}
            >
              {secondary.label}
            </Button>
          )}
          {primary && (
            <Button
              className="bg-stone-50 text-stone-900 hover:bg-stone-200 min-w-[10rem]"
              loading={loading === primary.action}
              disabled={primary.disabled}
              onClick={() => {
                if (primary!.action === 'play_again' && !window.confirm('Start a new game with the same players?')) return
                void control(primary!.action, primary!.extra)
              }}
            >
              {primary.label}
            </Button>
          )}
        </div>
      </footer>
    </main>
  )
}
