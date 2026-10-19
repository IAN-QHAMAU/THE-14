'use client'
import { useEffect, useRef } from 'react'
import { CATEGORIES, GAME_TYPES, type PublicQuestion } from '@/lib/game/questions/schema'
import { useServerNow } from '@/lib/clock'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

interface Props {
  question: PublicQuestion
  number: number
  total: number
  startsAt: string
  size?: 'phone' | 'stage'
  label?: string
}

/** The calm beat between questions: what is coming, then 3, 2, 1. */
export function GetReady({ question, number, total, startsAt, size = 'phone', label }: Props) {
  const now = useServerNow(100)
  const left = Date.parse(startsAt) - now
  const count = Math.max(1, Math.ceil(left / 1000))
  const showCount = left <= 3000
  const cat = CATEGORIES[question.category]
  const type = GAME_TYPES[question.type]
  const last = useRef<number | null>(null)

  useEffect(() => {
    if (!showCount || last.current === count) return
    last.current = count
    sound.count()
  }, [showCount, count])

  const stage = size === 'stage'

  return (
    <div className="flex flex-col items-center justify-center text-center gap-8 animate-fade-in">
      <div className="space-y-2">
        <p className={cn('tracking-widest uppercase text-stone-400', stage ? 'text-sm' : 'text-xs')}>
          {label ?? `Question ${number} of ${total}`}
        </p>
        <p className={cn('font-light text-stone-100', stage ? 'text-5xl' : 'text-3xl')}>{type.label}</p>
        <p className={cn('text-stone-400', stage ? 'text-lg' : 'text-sm')}>
          {question.category === 'party' ? type.description : `${cat.emoji} ${cat.label}`}
        </p>
      </div>

      <div className={cn('flex items-center justify-center', stage ? 'h-40' : 'h-28')}>
        {showCount ? (
          <span key={count} className={cn('font-light text-stone-50 tabular-nums animate-count-pop', stage ? 'text-[9rem] leading-none' : 'text-8xl')}>
            {count}
          </span>
        ) : (
          <span className="text-sm text-stone-500">Get ready</span>
        )}
      </div>
    </div>
  )
}
