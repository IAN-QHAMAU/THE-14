'use client'

import { AvatarDisplay } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import type { PlayerScoreEntry, RevealPayload } from '@/types'

interface Props {
  scores: PlayerScoreEntry[]
  lastReveal?: RevealPayload | null
  myPlayerId?: string
  size?: 'phone' | 'stage'
  limit?: number
  title?: string
  subtitle?: string
}

/** Leaderboard with movement arrows since the last question. */
export function Standings({ scores, lastReveal, myPlayerId, size = 'phone', limit, title = 'Standings', subtitle }: Props) {
  const stage = size === 'stage'
  const rows = limit ? scores.slice(0, limit) : scores
  const mine = myPlayerId ? scores.findIndex((s) => s.player_id === myPlayerId) : -1

  return (
    <div className="w-full space-y-5">
      <header className="text-center space-y-1 animate-fade-up">
        <h1 className={cn('font-light text-stone-50', stage ? 'text-5xl' : 'text-3xl')}>{title}</h1>
        {subtitle && <p className={cn('text-stone-400', stage ? 'text-lg' : 'text-sm')}>{subtitle}</p>}
      </header>

      <ol className="space-y-1.5">
        {rows.map((s, i) => {
          const rank = scores.filter((o) => o.total > s.total).length + 1
          const before = lastReveal?.rank_before[s.player_id]
          const moved = before ? before - rank : 0
          const gained = lastReveal?.results[s.player_id]?.points ?? 0
          const isMe = s.player_id === myPlayerId
          return (
            <li
              key={s.player_id}
              className={cn(
                'flex items-center gap-3 rounded-xl animate-fade-up',
                stage ? 'px-5 py-3.5' : 'px-3 py-2.5',
                isMe ? 'bg-stone-50 text-stone-900' : 'bg-stone-800 text-stone-100',
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className={cn('font-mono w-6 text-right', stage ? 'text-lg' : 'text-sm', isMe ? 'text-stone-500' : 'text-stone-400')}>{rank}</span>
              <AvatarDisplay avatarId={s.avatar} size={stage ? 'md' : 'sm'} />
              <span className={cn('flex-1 min-w-0 truncate', stage ? 'text-xl' : 'text-sm')}>
                {s.name}
                {s.streak >= 3 && <span className="ml-2 text-xs opacity-70">🔥{s.streak}</span>}
              </span>
              {gained > 0 && <span className={cn('font-mono text-xs', isMe ? 'text-emerald-700' : 'text-emerald-400')}>+{gained}</span>}
              <span className={cn('w-8 text-xs text-right', moved > 0 ? 'text-emerald-500' : moved < 0 ? 'text-rose-400' : 'text-transparent')}>
                {moved > 0 ? `▲${moved}` : moved < 0 ? `▼${-moved}` : '·'}
              </span>
              <span className={cn('font-mono tabular-nums text-right', stage ? 'text-xl w-20' : 'text-sm w-14')}>{s.total}</span>
            </li>
          )
        })}
      </ol>

      {limit && mine >= limit && (
        <p className="text-center text-sm text-stone-400">
          You are {mine + 1} of {scores.length}.
        </p>
      )}
    </div>
  )
}
