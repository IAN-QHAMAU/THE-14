'use client'
import { useEffect, useRef } from 'react'
import { useServerNow } from '@/lib/clock'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

interface TimerBarProps {
  startsAt: string
  endsAt: string
  /** Soft tick in the last five seconds. */
  ticking?: boolean
  dark?: boolean
  className?: string
}

/** Seconds left plus a thin bar that drains as time runs out. */
export function TimerBar({ startsAt, endsAt, ticking = false, dark = false, className }: TimerBarProps) {
  const now = useServerNow(200)
  const start = Date.parse(startsAt)
  const end = Date.parse(endsAt)
  const total = Math.max(1, end - start)
  const left = Math.max(0, end - now)
  const secs = Math.ceil(left / 1000)
  const pct = Math.min(100, (left / total) * 100)
  const urgent = secs <= 5 && left > 0
  const lastTick = useRef<number | null>(null)

  useEffect(() => {
    if (!ticking || !urgent || lastTick.current === secs) return
    lastTick.current = secs
    sound.tick()
  }, [ticking, urgent, secs])

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 h-1 rounded-full overflow-hidden', dark ? 'bg-stone-700' : 'bg-stone-200')}>
        <div
          className={cn('h-full rounded-full transition-[width] duration-200 ease-linear', urgent ? 'bg-rose-500' : dark ? 'bg-stone-300' : 'bg-stone-800')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          'font-mono tabular-nums text-sm w-7 text-right transition-colors',
          urgent ? 'text-rose-600' : dark ? 'text-stone-400' : 'text-stone-500',
        )}
      >
        {secs}
      </span>
    </div>
  )
}
