'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/lib/hooks/useGameState'
import { Button } from '@/components/ui/Button'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { VoiceHeaderButton, useSpeaking } from '@/components/voice/Voice'
import { VoiceProvider } from '@/lib/voice/VoiceProvider'
import { HostStage } from '@/components/gm/HostStage'
import { DEFAULT_SETTINGS, GameSetup, poolSize, setupSummary } from '@/components/gm/GameSetup'
import { ReactionLayer, useReactions } from '@/components/game/Reactions'
import { serverNow, useServerNow } from '@/lib/clock'
import { sound } from '@/lib/sound'
import { MIN_QUESTIONS, PICKABLE_CATEGORIES, ALL_TYPES, isFirstPhase, type GameSettings } from '@/lib/game/questions'
import { formatTime, cn } from '@/lib/utils'

const SETTINGS_KEY = 'the14_gm_settings'
const AUTO_KEY = 'the14_gm_auto'
const AUTOPLAY_KEY = 'the14_gm_autoplay'

// Auto play pacing, in milliseconds.
const INTRO_MS = 5000
const REVEAL_MS = 6000
const REVEAL_LONG_MS = 9000 // Bluff, Closest and Most Likely reveals have more to read.
const STANDINGS_MS = 5000
const STANDINGS_EVERY = 3

function store(key: string, on: boolean) {
  try {
    window.localStorage.setItem(key, on ? '1' : '0')
  } catch {
    // Storage blocked, fine.
  }
}

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
      difficulty: s.difficulty ?? 'mixed',
      finalWager: s.finalWager === true,
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
  const [autoPlay, setAutoPlay] = useState(true)
  const [autoAt, setAutoAt] = useState<number | null>(null)
  const [joinUrl, setJoinUrl] = useState('/join')
  const [panelOpen, setPanelOpen] = useState(false)
  const autoFired = useRef<string | null>(null)
  const playFired = useRef<string | null>(null)
  const now = useServerNow(500)

  const { items } = useReactions(state?.game.id)

  useEffect(() => {
    setSettings(loadSettings())
    try {
      setAuto(window.localStorage.getItem(AUTO_KEY) !== '0')
      setAutoPlay(window.localStorage.getItem(AUTOPLAY_KEY) !== '0')
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
      store(AUTO_KEY, !a)
      return !a
    })
  }

  const toggleAutoPlay = () => {
    setAutoPlay((a) => {
      store(AUTOPLAY_KEY, !a)
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

  // A brand new game with a new code. The old one is wrapped up on the server.
  const newGame = useCallback(async () => {
    const status = state?.game.status
    const inProgress = status && !['waiting', 'finished'].includes(status)
    const ask = inProgress
      ? 'End this game and start a new one with a new code?'
      : status === 'waiting'
        ? 'Close this lobby and start a new game with a new code?'
        : null
    if (ask && !window.confirm(ask)) return
    sound.unlock()
    setLoading('new_game')
    setError('')
    try {
      const res = await fetch('/api/game/create', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Could not create game.')
      await refresh()
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(null)
    }
  }, [state?.game.status, refresh])

  if (state && !state.isGameMaster) router.push('/room')

  const round = state?.currentRound
  const phase = round?.data?.phase
  const realPlayers = useMemo(() => (state?.players ?? []).filter((p) => !p.is_game_master), [state?.players])

  // Auto play always reveals automatically too.
  const autoReveal = auto || autoPlay

  // Auto reveal: when everyone has answered, or the timer runs out.
  useEffect(() => {
    if (!autoReveal || !state || state.game.status !== 'active' || !round || !round.ends_at) return
    if (!['active', 'voting'].includes(round.status)) return
    const key = `${round.id}:${round.status}:${phase ?? ''}`
    if (autoFired.current === key) return
    // Players who have gone away do not hold up the reveal.
    const here = realPlayers.filter((p) => p.is_connected).length || realPlayers.length
    // Sync: first only the player who goes first answers, then everyone else.
    const spot = round.data?.sync?.id
    const allIn =
      phase === 'pick' ? Boolean(spot && state.submissionStatus[spot])
      : spot ? state.answeredCount >= Math.max(1, here - 1)
      : here > 0 && state.answeredCount >= here
    const started = round.starts_at ? serverNow() >= Date.parse(round.starts_at) : true
    // Bets can be changed until time runs out, so betting always gets its full time.
    const delay = allIn && started && phase !== 'wager' ? 1200 : Math.max(0, Date.parse(round.ends_at) - serverNow() + 800)
    const action = isFirstPhase(phase) ? 'start_voting' : 'lock_question'
    const t = setTimeout(() => {
      autoFired.current = key
      void control(action, undefined, true)
    }, delay)
    return () => clearTimeout(t)
  }, [autoReveal, state, round, phase, realPlayers.length, control])

  // Auto play: intro, reveal and standings move on by themselves.
  const status = state?.game.status
  const roundNo = state?.game.current_round ?? 0
  const total = state?.game.total_questions ?? 0
  const revealType = state?.reveal?.type
  useEffect(() => {
    setAutoAt(null)
    // A new game (Play again) starts its question count from zero again.
    if (status === 'waiting') playFired.current = null
    if (!autoPlay || !status || !['category', 'question_result', 'leaderboard'].includes(status)) return
    const key = `${status}:${roundNo}`
    if (playFired.current === key) return

    let delay = STANDINGS_MS
    let action = 'next_question'
    if (status === 'category') delay = INTRO_MS
    if (status === 'question_result') {
      delay = revealType === 'bluff' || revealType === 'closest' || revealType === 'mostlikely' ? REVEAL_LONG_MS : REVEAL_MS
      // Standings every few questions and before the final results.
      if (roundNo % STANDINGS_EVERY === 0 || roundNo >= total) action = 'show_leaderboard'
    }

    setAutoAt(serverNow() + delay)
    const t = setTimeout(() => {
      playFired.current = key
      setAutoAt(null)
      void control(action, undefined, true)
    }, delay)
    return () => clearTimeout(t)
  }, [autoPlay, status, roundNo, total, revealType, control])

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
      primary =
        phase === 'write' ? { label: 'Start voting', action: 'start_voting' }
        : phase === 'wager' ? { label: 'Show the question', action: 'start_voting' }
        : phase === 'pick' ? { label: 'Start guessing', action: 'start_voting' }
        : { label: 'Reveal answer', action: 'lock_question' }
      break
    case 'question_result':
      primary = { label: isLast ? 'Final results' : 'Next question', action: 'next_question' }
      secondary = { label: 'Standings', action: 'show_leaderboard' }
      break
    case 'leaderboard':
      primary = { label: isLast ? 'Final results' : 'Next question', action: 'next_question' }
      break
    case 'finished':
      primary = { label: 'New game', action: 'new_game' }
      secondary = { label: 'Play again', action: 'play_again' }
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
              <div key={p.id} className={cn('group flex items-center gap-2.5 py-2 px-2.5 rounded-xl bg-stone-800/60', !p.is_connected && 'opacity-60')}>
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', p.is_connected ? 'bg-emerald-500' : 'bg-stone-600')} />
                <PlayerVoice playerId={p.id} avatar={p.avatar} />
                <span className="text-sm text-stone-200 flex-1 truncate">
                  {p.name}
                  {!p.is_connected && <span className="ml-1.5 text-xs text-stone-500">away</span>}
                  {p.streak >= 3 && <span className="ml-1.5 text-xs text-stone-400">🔥{p.streak}</span>}
                </span>
                {game.status === 'active' && (
                  <span className={cn('text-xs', answered ? 'text-emerald-400' : 'text-stone-600')}>{answered ? '✓' : '…'}</span>
                )}
                <span className="text-xs font-mono text-stone-400 w-12 text-right">{p.score}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove ${p.name} from the game?`)) void control('remove_player', { playerId: p.id })
                  }}
                  aria-label={`Remove ${p.name}`}
                  className="text-stone-600 hover:text-rose-400 px-1 text-base leading-none"
                >
                  ×
                </button>
              </div>
            )
          })}
        {realPlayers.length === 0 && <p className="text-sm text-stone-500 py-2">No one has joined yet.</p>}
      </div>
    </div>
  )

  const voiceQuiet = game.settings?.voiceQuiet !== false
  return (
    <VoiceProvider
      gameId={game.id}
      me={state.myPlayer ? { id: state.myPlayer.id, name: 'Host', avatar: state.myPlayer.avatar } : null}
      isHost
      // The host never sees answers early, so they can keep talking (and read questions out).
      quiet={false}
      quietDuringQuestions={voiceQuiet}
      callLink={game.settings?.callLink}
    >
    <main className="min-h-[100dvh] bg-stone-900 text-stone-50 flex flex-col">
      <ReactionLayer items={items} showNames />

      {/* Top bar */}
      <header className="flex items-center justify-between gap-2 px-4 md:px-8 py-3 md:py-4 border-b border-stone-800">
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="text-lg font-medium whitespace-nowrap">THE 14</h1>
          <span className="hidden sm:inline text-xs text-stone-500 uppercase tracking-widest">{STATUS_LABEL[game.status] ?? game.status}</span>
          {game.status !== 'waiting' && <span className="font-mono text-sm tracking-widest text-stone-400">{game.game_code}</span>}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {game.status !== 'finished' && (
            <button
              type="button"
              onClick={() => void newGame()}
              disabled={loading === 'new_game'}
              className="text-xs text-stone-400 rounded-full border border-stone-700 px-2.5 sm:px-3 py-1 whitespace-nowrap hover:text-stone-200 hover:border-stone-500 disabled:opacity-50"
            >
              New game
            </button>
          )}
          <VoiceHeaderButton onSaveSettings={(v) => void control('voice_settings', v)} />
          <SoundToggle dark />
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-label={panelOpen ? 'Hide players' : 'Show players'}
            className="lg:hidden text-xs text-stone-400 rounded-full border border-stone-700 px-2.5 py-1 whitespace-nowrap"
          >
            {panelOpen ? 'Hide' : `👥 ${realPlayers.length}`}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        {/* Stage */}
        <section className="min-w-0 px-4 md:px-10 py-6 md:py-12 flex flex-col items-center justify-center min-h-[50vh] lg:sticky lg:top-0 lg:h-[calc(100dvh-8.5rem)] lg:overflow-y-auto">
          <HostStage state={state} joinUrl={joinUrl} />
        </section>

        {/* Side panel */}
        <aside className={cn('min-w-0 border-t lg:border-t-0 lg:border-l border-stone-800 px-4 py-6 space-y-8 lg:block lg:h-[calc(100dvh-8.5rem)] lg:overflow-y-auto', panelOpen || game.status === 'waiting' ? 'block' : 'hidden')}>
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
        <div className="flex flex-wrap items-center gap-2 max-w-5xl mx-auto">
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
          {['category', 'active', 'question_result', 'leaderboard'].includes(game.status) && (
            <>
              <Switch on={autoPlay} onClick={toggleAutoPlay} label="Auto play" />
              {!autoPlay && game.status === 'active' && <Switch on={auto} onClick={toggleAuto} label="Auto reveal" />}
            </>
          )}
          {autoAt && (
            <span className="text-xs text-stone-500 tabular-nums">Next in {Math.max(1, Math.ceil((autoAt - now) / 1000))}s</span>
          )}
          {game.status === 'waiting' && !error && (
            <p className="hidden sm:block text-sm text-stone-400 truncate">
              {setupSummary(settings, Math.min(settings.questionCount, pool))}
              <span className="text-stone-600"> · </span>
              {realPlayers.length} {realPlayers.length === 1 ? 'player' : 'players'}
            </p>
          )}
          <div className="flex-1 text-right text-sm text-rose-400 truncate">{error}</div>
          <div className="flex gap-2 w-full sm:w-auto">
          {secondary && (
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none bg-transparent border-stone-700 text-stone-200 hover:bg-stone-800"
              loading={loading === secondary.action}
              onClick={() => {
                if (secondary!.action === 'play_again') {
                  if (!window.confirm('Play again with the same players and code?')) return
                }
                void control(secondary!.action)
              }}
            >
              {secondary.label}
            </Button>
          )}
          {primary && (
            <Button
              className="flex-[2] sm:flex-none bg-accent text-accent-ink hover:bg-accent-deep disabled:bg-stone-700 disabled:text-stone-400 sm:min-w-[10rem]"
              loading={loading === primary.action}
              disabled={primary.disabled}
              onClick={() => {
                if (primary!.action === 'new_game') return void newGame()
                void control(primary!.action, primary!.extra)
              }}
            >
              {primary.label}
            </Button>
          )}
          </div>
        </div>
      </footer>
    </main>
    </VoiceProvider>
  )
}

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 text-xs text-stone-400 px-2 py-2" aria-pressed={on}>
      <span className={cn('w-7 h-4 rounded-full relative transition-colors', on ? 'bg-accent' : 'bg-stone-700')}>
        <span className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', on ? 'left-3.5' : 'left-0.5')} />
      </span>
      {label}
    </button>
  )
}

/** Avatar with a speaking ring and a small mic dot for players in voice. */
function PlayerVoice({ playerId, avatar }: { playerId: string; avatar: string }) {
  const { inVoice, talking, muted } = useSpeaking(playerId)
  return (
    <span className="relative flex-shrink-0">
      <AvatarDisplay avatarId={avatar} size="xs" className={cn(talking && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-stone-800')} />
      {inVoice && (
        <span
          className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-stone-800', muted ? 'bg-stone-500' : 'bg-emerald-500')}
          title={muted ? 'In voice, muted' : 'In voice'}
        />
      )}
    </span>
  )
}
