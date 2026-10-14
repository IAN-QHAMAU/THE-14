'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/db/supabase'
import { reactionChannel, type ReactionMessage } from '@/lib/realtime/subscriptions'
import { cn } from '@/lib/utils'

export const REACTION_EMOJIS = ['👏', '😂', '😮', '🔥', '😭', '👀']

interface Floating extends ReactionMessage {
  key: number
  x: number
}

/** Live emoji reactions over a broadcast channel. Nothing is saved. */
export function useReactions(gameId: string | undefined, me?: { id: string; name: string }) {
  const [items, setItems] = useState<Floating[]>([])
  const channel = useRef<RealtimeChannel | null>(null)
  const lastSent = useRef(0)
  const counter = useRef(0)

  useEffect(() => {
    if (!gameId) return
    const ch = reactionChannel(gameId, (r) => {
      const key = ++counter.current
      setItems((list) => [...list.slice(-24), { ...r, key, x: 8 + Math.random() * 84 }])
      setTimeout(() => setItems((list) => list.filter((i) => i.key !== key)), 2300)
    })
    channel.current = ch
    return () => {
      channel.current = null
      supabase.removeChannel(ch)
    }
  }, [gameId])

  const send = useCallback(
    (emoji: string) => {
      if (!me || !channel.current) return
      const now = Date.now()
      if (now - lastSent.current < 600) return
      lastSent.current = now
      void channel.current.send({
        type: 'broadcast',
        event: 'react',
        payload: { emoji, player_id: me.id, name: me.name } satisfies ReactionMessage,
      })
    },
    [me],
  )

  return { items, send }
}

export function ReactionLayer({ items, showNames = false }: { items: Floating[]; showNames?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40" aria-hidden>
      {items.map((r) => (
        <div key={r.key} className="absolute bottom-24 flex flex-col items-center animate-float-up" style={{ left: `${r.x}%` }}>
          <span className={showNames ? 'text-5xl' : 'text-3xl'}>{r.emoji}</span>
          {showNames && <span className="text-xs text-stone-400 mt-1">{r.name}</span>}
        </div>
      ))}
    </div>
  )
}

export function ReactionBar({ onSend, dark = false }: { onSend: (emoji: string) => void; dark?: boolean }) {
  return (
    <div className={cn('flex items-center justify-center gap-1 rounded-full p-1 mx-auto w-fit', dark ? 'bg-stone-800' : 'bg-white border border-stone-200')}>
      {REACTION_EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onSend(e)}
          className={cn('w-10 h-10 rounded-full text-xl transition-transform active:scale-90', dark ? 'hover:bg-stone-700' : 'hover:bg-stone-100')}
          aria-label={`React ${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
