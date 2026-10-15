'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { InstallApp } from '@/components/InstallApp'
import type { GameStateResponse } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  waiting: 'In the lobby',
  category: 'About to start',
  active: 'In progress',
  question_result: 'In progress',
  leaderboard: 'In progress',
}

export default function GMPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState<{ code: string; status: string; players: number } | null>(null)

  // If this device is already hosting a game, offer to continue it.
  useEffect(() => {
    fetch('/api/game/state', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: GameStateResponse | null) => {
        if (s?.isGameMaster && s.game.status !== 'finished') {
          setCurrent({
            code: s.game.game_code,
            status: s.game.status,
            players: s.players.filter((p) => !p.is_game_master).length,
          })
        }
      })
      .catch(() => {})
  }, [])

  async function handleCreate() {
    if (current && current.status !== 'waiting' && !window.confirm(`End game ${current.code} and start a new one?`)) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game/create', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not create game.')
        return
      }
      router.push('/gm/control')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-stone-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-10">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-stone-900">THE 14</h1>
          <p className="mt-1 text-xs text-stone-400 tracking-widest uppercase">Game Master</p>
        </div>

        {current && (
          <section className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center justify-between gap-4 animate-fade-up">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest">Your game</p>
              <p className="font-mono text-2xl tracking-widest text-stone-800 mt-0.5">{current.code}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {STATUS_LABEL[current.status] ?? 'Open'} · {current.players} {current.players === 1 ? 'player' : 'players'}
              </p>
            </div>
            <Button onClick={() => router.push('/gm/control')}>Continue</Button>
          </section>
        )}

        <div className="space-y-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            {current
              ? 'Or start fresh with a new code. Your current game will be wrapped up so nobody is left waiting.'
              : "Create a new game. You'll get a 5-letter code to share with up to 14 players."}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button size="lg" variant={current ? 'secondary' : 'primary'} onClick={handleCreate} loading={loading}>
            {current ? 'Start a new game' : 'Create new game'}
          </Button>
        </div>

        <InstallApp />

        <div className="border-t border-stone-100 pt-6">
          <button
            onClick={() => router.push('/join')}
            className="text-xs text-stone-400 underline underline-offset-4 hover:text-stone-700 transition-colors"
          >
            Join as a player instead
          </button>
        </div>
      </div>
    </main>
  )
}
