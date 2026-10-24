'use client'

import { useEffect, useState } from 'react'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'
import type { Award, PlayerScoreEntry, PlayerTag } from '@/types'

interface Props {
  scores: PlayerScoreEntry[]
  awards?: Award[]
  tags?: Record<string, PlayerTag>
  myPlayerId?: string
  size?: 'phone' | 'stage'
  children?: React.ReactNode
  /** Replaces the podium, like the Team Battle finale. */
  hero?: React.ReactNode
}

const PLACE = ['1st', '2nd', '3rd']

export function Podium({ scores, awards = [], tags = {}, myPlayerId, size = 'phone', children, hero }: Props) {
  const [step, setStep] = useState(0)
  const stage = size === 'stage'

  const sorted = [...scores].sort((a, b) => b.total - a.total)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)
  const byId = new Map(scores.map((s) => [s.player_id, s]))

  // Display order on the podium: 2nd, 1st, 3rd. Reveal order: 3rd, 2nd, 1st.
  const slots = [
    { entry: top3[1], rank: 2, height: stage ? 'h-40' : 'h-24', revealAt: 2 },
    { entry: top3[0], rank: 1, height: stage ? 'h-56' : 'h-32', revealAt: 3 },
    { entry: top3[2], rank: 3, height: stage ? 'h-28' : 'h-16', revealAt: 1 },
  ]

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1700),
      setTimeout(() => {
        setStep(3)
        sound.fanfare()
      }, 2900),
      setTimeout(() => setStep(4), 3900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const myRank = myPlayerId ? sorted.findIndex((s) => s.player_id === myPlayerId) + 1 : 0

  return (
    <div className={cn('w-full mx-auto flex flex-col gap-10', stage ? 'max-w-3xl' : 'max-w-md')}>
      {hero ?? (
      <>
      <header className="text-center animate-fade-up">
        <p className="text-xs tracking-widest uppercase text-stone-500">Final results</p>
        <h1 className={cn('font-light mt-1 text-stone-50', stage ? 'text-5xl' : 'text-3xl')}>THE 14</h1>
        {myRank > 0 && step >= 4 && (
          <p className="text-sm text-stone-400 mt-2 animate-fade-in">
            {myRank === 1 ? 'You won. Well played.' : `You finished ${myRank} of ${sorted.length}.`}
            {myPlayerId && tags[myPlayerId] && (
              <span className="block text-stone-200 mt-1">
                {tags[myPlayerId].title}
                <span className="text-stone-500"> · {tags[myPlayerId].detail}</span>
              </span>
            )}
          </p>
        )}
      </header>

      <section className="flex items-end justify-center gap-3" aria-label="Top three players">
        {slots.map(({ entry, rank, height, revealAt }) => {
          const shown = step >= revealAt
          const isMe = entry?.player_id === myPlayerId
          return (
            <div key={rank} className={cn('flex flex-col items-center gap-2 min-w-0', stage ? 'w-40' : 'w-24')}>
              <div className={cn('flex flex-col items-center gap-1 transition-all duration-500', shown && entry ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
                {entry && (
                  <>
                    <AvatarDisplay avatarId={entry.avatar} size={stage ? 'xl' : 'lg'} mood={shown && rank === 1 ? 'happy' : null} />
                    <p className={cn('font-medium text-center truncate max-w-full', stage ? 'text-lg' : 'text-xs', isMe ? 'text-stone-50' : 'text-stone-300')}>
                      {entry.name}
                    </p>
                    <p className={cn('font-mono text-stone-400', stage ? 'text-base' : 'text-xs')}>{entry.total}</p>
                    {tags[entry.player_id] && (
                      <p className={cn('text-stone-500 text-center truncate max-w-full', stage ? 'text-sm' : 'text-[10px]')}>{tags[entry.player_id].title}</p>
                    )}
                  </>
                )}
              </div>
              <div
                className={cn(
                  'w-full rounded-t-xl flex items-start justify-center pt-3 origin-bottom',
                  height,
                  rank === 1 ? 'bg-stone-200 text-stone-900' : rank === 2 ? 'bg-stone-600 text-stone-100' : 'bg-stone-700 text-stone-300',
                  step >= 1 ? 'animate-rise' : 'scale-y-0',
                )}
                style={{ animationDelay: `${(3 - rank) * 120}ms` }}
              >
                <span className={cn('font-light', stage ? 'text-2xl' : 'text-sm')}>{PLACE[rank - 1]}</span>
              </div>
            </div>
          )
        })}
      </section>
      </>
      )}

      {step >= 4 && awards.length > 0 && (
        <section className="space-y-2 animate-fade-up">
          <p className="text-xs tracking-widest uppercase text-stone-500">Awards</p>
          <div className={cn('grid gap-2', stage ? 'grid-cols-3' : 'grid-cols-2')}>
            {awards.map((a) => {
              const p = byId.get(a.player_id)
              return (
                <div key={a.id} className={cn('rounded-xl bg-stone-800 p-3 flex items-center gap-3', a.player_id === myPlayerId && 'ring-1 ring-stone-400')}>
                  {p && <AvatarDisplay avatarId={p.avatar} size="sm" />}
                  <div className="min-w-0">
                    <p className="text-xs text-stone-400">{a.title}</p>
                    <p className="text-sm text-stone-100 truncate">{p?.name ?? 'Player'}</p>
                    <p className="text-[11px] text-stone-500">{a.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {step >= 4 && !hero && rest.length > 0 && (
        <section className="space-y-1.5 animate-fade-up">
          <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Everyone else</p>
          {rest.map((entry, index) => {
            const isMe = entry.player_id === myPlayerId
            return (
              <div key={entry.player_id} className={cn('flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl', isMe ? 'bg-stone-700' : 'bg-stone-800/60')}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-stone-500 w-4">{index + 4}</span>
                  <AvatarDisplay avatarId={entry.avatar} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-sm text-stone-300 truncate">{entry.name}</span>
                    {tags[entry.player_id] && <span className="block text-[11px] text-stone-500 truncate">{tags[entry.player_id].title}</span>}
                  </span>
                </div>
                <span className="font-mono text-sm text-stone-400">{entry.total}</span>
              </div>
            )
          })}
        </section>
      )}

      {step >= 4 && children}
    </div>
  )
}
