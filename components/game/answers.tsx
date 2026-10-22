'use client'
import { useEffect, useState } from 'react'
import type { PublicQuestion } from '@/lib/game/questions/schema'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useServerNow } from '@/lib/clock'
import { cn } from '@/lib/utils'
import { tidyAnswer } from '@/lib/game/scoring'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']

// ─── Prompt extras: emoji row and blurred picture ──────────────────────────

export function PromptExtras({
  question,
  startsAt,
  endsAt,
  size = 'phone',
}: {
  question: PublicQuestion
  startsAt?: string | null
  endsAt?: string | null
  size?: 'phone' | 'stage'
}) {
  if (question.type === 'emoji' && question.emoji) {
    return (
      <p className={cn('text-center tracking-widest select-none', size === 'stage' ? 'text-8xl py-6' : 'text-6xl py-4')} aria-label="Emoji clue">
        {question.emoji}
      </p>
    )
  }
  if (question.type === 'picture' && question.image) {
    return <PictureFrame src={question.image} startsAt={startsAt} endsAt={endsAt} size={size} />
  }
  if (question.type === 'order' && question.hint) {
    return <p className="text-sm text-stone-500">{question.hint}</p>
  }
  return null
}

/** The image starts blurred and zoomed in, then sharpens as time runs out. */
export function PictureFrame({
  src,
  startsAt,
  endsAt,
  size = 'phone',
  reveal = false,
}: {
  src: string
  startsAt?: string | null
  endsAt?: string | null
  size?: 'phone' | 'stage'
  reveal?: boolean
}) {
  const now = useServerNow(150)
  const [failed, setFailed] = useState(false)
  const start = startsAt ? Date.parse(startsAt) : now
  const end = endsAt ? Date.parse(endsAt) : now
  // Fully sharp at 70% of the time.
  const progress = reveal ? 1 : Math.min(1, Math.max(0, (now - start) / Math.max(1, (end - start) * 0.7)))
  const blur = 18 * (1 - progress)
  const scale = 1 + 1.4 * (1 - progress)

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-stone-200 mx-auto w-full', size === 'stage' ? 'max-w-xl aspect-[3/2]' : 'aspect-[3/2]')}>
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-500">Image did not load</div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-[filter,transform] duration-200 ease-linear"
          style={{ filter: `blur(${blur}px)`, transform: `scale(${scale})` }}
          draggable={false}
        />
      )}
    </div>
  )
}

// ─── Option pad (choice, true/false, emoji, picture, bluff vote) ───────────

export function OptionPad({
  options,
  selected,
  disabled,
  disabledIndex,
  onPick,
  compact,
}: {
  options: string[]
  selected: number | null
  disabled: boolean
  disabledIndex?: number | null
  onPick: (i: number) => void
  compact?: boolean
}) {
  const two = options.length === 2
  return (
    <div className={cn('gap-2.5', two ? 'grid grid-cols-2' : 'flex flex-col')}>
      {options.map((opt, idx) => {
        const isSelected = selected === idx
        const isOwn = disabledIndex === idx
        const faded = (selected !== null && !isSelected) || isOwn
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onPick(idx)}
            disabled={disabled || isOwn}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98] disabled:cursor-default',
              two ? 'justify-center p-6 text-base font-medium' : compact ? 'p-3' : 'p-4',
              isSelected
                ? 'border-stone-900 bg-stone-900 text-stone-50'
                : faded
                  ? 'border-stone-100 bg-stone-50 text-stone-300'
                  : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400',
            )}
          >
            {!two && (
              <span
                className={cn(
                  'w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-semibold',
                  isSelected ? 'bg-stone-700 text-stone-50' : faded ? 'bg-stone-100 text-stone-300' : 'bg-stone-100 text-stone-500',
                )}
              >
                {LETTERS[idx]}
              </span>
            )}
            <span className="text-sm leading-snug">{opt}</span>
            {isOwn && <span className="ml-auto text-xs text-stone-400">Yours</span>}
          </button>
        )
      })}
    </div>
  )
}

// ─── Player vote (Most Likely To) ──────────────────────────────────────────

export function PlayerVote({
  players,
  selected,
  disabled,
  onPick,
}: {
  players: { id: string; name: string; avatar: string }[]
  selected: number | null
  disabled: boolean
  onPick: (i: number) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {players.map((p, idx) => {
        const isSelected = selected === idx
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(idx)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all active:scale-[0.97] disabled:cursor-default',
              isSelected ? 'border-stone-900 bg-stone-900 text-stone-50' : selected !== null ? 'border-stone-100 opacity-40' : 'border-stone-200 bg-white hover:border-stone-400',
            )}
          >
            <AvatarDisplay avatarId={p.avatar} size="md" />
            <span className="text-xs truncate max-w-full">{p.name}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Closest number ────────────────────────────────────────────────────────

export function ClosestInput({
  question,
  disabled,
  submitted,
  onSubmit,
}: {
  question: PublicQuestion
  disabled: boolean
  submitted: number | null
  onSubmit: (value: number) => void
}) {
  const min = question.min ?? 0
  const max = question.max ?? 100
  const step = question.step ?? 1
  const [value, setValue] = useState<number>(submitted ?? Math.round((min + max) / 2 / step) * step)
  const [text, setText] = useState(String(value))

  useEffect(() => {
    if (submitted !== null) {
      setValue(submitted)
      setText(String(submitted))
    }
  }, [submitted])

  const commitText = (t: string) => {
    setText(t)
    const n = Number(t.replace(/,/g, ''))
    if (Number.isFinite(n) && t.trim() !== '') setValue(Math.min(max, Math.max(min, n)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => commitText(e.target.value)}
          onBlur={() => setText(String(value))}
          disabled={disabled}
          className="w-44 text-center text-5xl font-light bg-transparent border-b border-stone-200 focus:border-stone-900 focus:outline-none tabular-nums disabled:text-stone-500"
          aria-label="Your guess"
        />
        {question.unit && <span className="text-lg text-stone-400">{question.unit}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          setValue(Number(e.target.value))
          setText(e.target.value)
        }}
        className="w-full"
        aria-label="Adjust guess"
      />
      <div className="flex justify-between text-xs text-stone-400 -mt-4">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
      <Button size="lg" disabled={disabled} onClick={() => onSubmit(value)}>
        {submitted !== null ? 'Locked in' : 'Lock it in'}
      </Button>
    </div>
  )
}

// ─── Final Wager ───────────────────────────────────────────────────────────

export function WagerInput({
  score,
  max,
  disabled,
  submitted,
  onSubmit,
}: {
  score: number
  max: number
  disabled: boolean
  submitted: number | null
  onSubmit: (value: number) => void
}) {
  const [value, setValue] = useState<number>(submitted ?? Math.round(max / 2 / 10) * 10)
  useEffect(() => {
    if (submitted !== null) setValue(submitted)
  }, [submitted])
  const presets = [0, Math.round(max / 2 / 10) * 10, max]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-5xl font-light tabular-nums text-stone-900">{value.toLocaleString()}</p>
        <p className="text-xs text-stone-400">
          You have {score.toLocaleString()} points. Bet up to {max.toLocaleString()}.
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={10}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full"
        aria-label="Your bet"
      />
      <div className="grid grid-cols-3 gap-2">
        {presets.map((p, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => setValue(p)}
            className={cn(
              'rounded-xl border py-2 text-sm transition-colors',
              value === p ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 text-stone-600',
            )}
          >
            {i === 0 ? 'Nothing' : i === 1 ? 'Half' : 'All in'}
          </button>
        ))}
      </div>
      <Button size="lg" disabled={disabled || value === submitted} onClick={() => onSubmit(value)}>
        {submitted === null ? 'Place bet' : value === submitted ? 'Bet placed' : 'Change bet'}
      </Button>
    </div>
  )
}

// ─── Sync ─────────────────────────────────────────────────────────────

/** Odd One Out: four big pictures in a grid. */
export function PicturePad({
  pics,
  selected,
  disabled,
  onPick,
}: {
  pics: string[]
  selected: number | null
  disabled: boolean
  onPick: (i: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {pics.map((pic, idx) => {
        const isSelected = selected === idx
        const faded = selected !== null && !isSelected
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onPick(idx)}
            disabled={disabled}
            aria-label={`Picture ${idx + 1}`}
            className={cn(
              'aspect-square rounded-3xl border flex items-center justify-center transition-all duration-150 active:scale-95 disabled:cursor-default',
              isSelected ? 'border-stone-900 bg-stone-900 shadow-lg scale-[1.02]' : faded ? 'border-stone-100 bg-stone-50 opacity-40' : 'border-stone-200 bg-white hover:border-stone-400',
            )}
          >
            <span className="text-7xl leading-none select-none">{pic}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Sync: pick one of the answers, or write your own. */
export function SyncPick({
  options,
  selected,
  written,
  disabled,
  onPick,
  onWrite,
}: {
  options: string[]
  selected: number | null
  written: string | null
  disabled: boolean
  onPick: (i: number) => void
  onWrite: (text: string) => void
}) {
  const [text, setText] = useState('')
  if (written) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-4 text-center space-y-1">
        <p className="text-xs uppercase tracking-widest text-stone-400">Your answer</p>
        <p className="text-lg text-stone-800">{tidyAnswer(written)}</p>
        <p className="text-xs text-stone-400 pt-2">It will look just like the others.</p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <OptionPad options={options} selected={selected} disabled={disabled} onPick={onPick} />
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) onWrite(text.trim())
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={40}
          disabled={disabled}
          placeholder="Or write your own"
          className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:border-stone-900"
          aria-label="Write your own answer"
          autoComplete="off"
        />
        <Button type="submit" disabled={disabled || !text.trim()} className="w-auto px-5">
          Send
        </Button>
      </form>
    </div>
  )
}

/** Shown while it is someone else's turn to answer. */
export function SyncWait({ avatar, title, text }: { avatar?: string; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-8 animate-fade-up">
      {avatar && <AvatarDisplay avatarId={avatar} size="xl" idle />}
      <p className="text-lg font-medium text-stone-900">{title}</p>
      <p className="text-sm text-stone-500 max-w-xs">{text}</p>
    </div>
  )
}

// ─── Put in order ──────────────────────────────────────────────────────────

export function OrderPicker({
  items,
  disabled,
  submitted,
  onSubmit,
}: {
  items: string[]
  disabled: boolean
  submitted: number[] | null
  onSubmit: (order: number[]) => void
}) {
  const [order, setOrder] = useState<number[]>(submitted ?? [])

  useEffect(() => {
    if (submitted) setOrder(submitted)
  }, [submitted])

  const tap = (i: number) => {
    if (disabled) return
    setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const pos = order.indexOf(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98] disabled:cursor-default',
                pos >= 0 ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 bg-white text-stone-800',
              )}
            >
              <span
                className={cn(
                  'w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-semibold',
                  pos >= 0 ? 'bg-stone-50 text-stone-900' : 'border border-dashed border-stone-300 text-stone-300',
                )}
              >
                {pos >= 0 ? pos + 1 : ''}
              </span>
              <span className="text-sm">{item}</span>
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" disabled={disabled || order.length === 0} onClick={() => setOrder([])}>
          Clear
        </Button>
        <Button className="flex-[2]" disabled={disabled || order.length !== items.length} onClick={() => onSubmit(order)}>
          {submitted ? 'Locked in' : order.length === items.length ? 'Lock it in' : `Tap ${items.length - order.length} more`}
        </Button>
      </div>
    </div>
  )
}

// ─── Bluff writing ─────────────────────────────────────────────────────────

export function BluffWrite({
  disabled,
  submitted,
  onSubmit,
}: {
  disabled: boolean
  submitted: string | null
  onSubmit: (text: string) => void
}) {
  const [text, setText] = useState(submitted ?? '')
  if (submitted) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-4 text-center space-y-1">
        <p className="text-xs uppercase tracking-widest text-stone-400">Your fake</p>
        <p className="text-lg text-stone-800">{tidyAnswer(submitted)}</p>
        <p className="text-xs text-stone-400 pt-2">Voting opens when everyone is done.</p>
      </div>
    )
  }
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (text.trim()) onSubmit(text.trim())
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={60}
        disabled={disabled}
        placeholder="Write something believable"
        className="w-full px-4 py-4 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:border-stone-900"
        aria-label="Your fake answer"
        autoComplete="off"
      />
      <Button size="lg" type="submit" disabled={disabled || !text.trim()}>
        Submit fake
      </Button>
      <p className="text-xs text-stone-400 text-center">Fool others into picking it. Points for every vote it gets.</p>
    </form>
  )
}
