'use client'

import { useEffect, useRef, useState } from 'react'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { POWER_CARDS } from '@/lib/game/powers'
import { cn } from '@/lib/utils'
import type { GameStateResponse } from '@/types'

/** The card you are holding, shown between questions, with a way to play it. */
export function PowerHand({ state, dark = false }: { state: GameStateResponse; dark?: boolean }) {
  const [picking, setPicking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const card = state.myCard

  useEffect(() => {
    if (!card) setPicking(false)
  }, [card])

  if (!state.game.settings?.powerUps) return null
  if (!card) {
    return note ? <p className={cn('text-sm text-center animate-fade-up', dark ? 'text-stone-400' : 'text-stone-500')}>{note}</p> : null
  }

  const info = POWER_CARDS[card]
  const others = state.players.filter((p) => !p.is_game_master && p.id !== state.myPlayer?.id)

  async function play(targetId?: string) {
    if (busy) return
    setBusy(true)
    setNote('')
    try {
      const res = await fetch('/api/game/power', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetId }) })
      const data = await res.json()
      if (!res.ok) setNote(data.error ?? 'Could not play that card.')
      else setNote(data.blocked ? 'A shield blocked it.' : `${info.label} played.`)
      setPicking(false)
    } catch {
      setNote('Connection problem. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={cn('rounded-2xl p-4 space-y-3 animate-fade-up', dark ? 'bg-stone-800/70' : 'bg-white border border-stone-200')}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{info.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-base font-medium', dark ? 'text-stone-100' : 'text-stone-900')}>{info.label}</p>
          <p className={cn('text-xs', dark ? 'text-stone-400' : 'text-stone-500')}>{info.blurb}</p>
        </div>
        {card === 'shield' ? (
          <span className="text-xs text-emerald-500">Ready</span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => (info.needsTarget ? setPicking((v) => !v) : play())}
            className="rounded-xl bg-accent text-stone-900 px-4 py-2 text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
          >
            {picking ? 'Cancel' : 'Play'}
          </button>
        )}
      </div>
      {picking && (
        <div className="grid grid-cols-3 gap-2 animate-fade-up">
          {others.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={busy}
              onClick={() => play(p.id)}
              className={cn('rounded-xl p-2 flex flex-col items-center gap-1 transition-colors', dark ? 'bg-stone-700/60 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200')}
            >
              <AvatarDisplay avatarId={p.avatar} size="sm" />
              <span className={cn('text-xs truncate max-w-full', dark ? 'text-stone-200' : 'text-stone-700')}>{p.name}</span>
            </button>
          ))}
        </div>
      )}
      {note && <p className={cn('text-xs', dark ? 'text-stone-400' : 'text-stone-500')}>{note}</p>}
    </section>
  )
}

/** The newest card play, shown briefly on every screen. */
export function PowerToast({ feed, dark = true, size = 'phone' }: { feed: GameStateResponse['powerFeed']; dark?: boolean; size?: 'phone' | 'stage' }) {
  const latest = feed[feed.length - 1]
  const seen = useRef<string | null>(null)
  const [shown, setShown] = useState<typeof latest | null>(null)

  useEffect(() => {
    if (!latest) return
    // Skip whatever was already in the feed when the screen opened.
    if (seen.current === null) {
      seen.current = latest.id
      if (Date.now() - Date.parse(latest.at) > 8000) return
    }
    if (seen.current === latest.id && shown) return
    seen.current = latest.id
    setShown(latest)
    const t = setTimeout(() => setShown(null), 4500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.id])

  if (!shown) return null
  return (
    <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4 pointer-events-none">
      <p
        key={shown.id}
        className={cn(
          'rounded-full px-5 py-2 shadow-lg animate-fade-up',
          dark ? 'bg-stone-800 text-stone-100 border border-stone-700' : 'bg-white text-stone-900 border border-stone-200',
          size === 'stage' ? 'text-2xl' : 'text-sm',
        )}
      >
        {shown.text}
      </p>
    </div>
  )
}
