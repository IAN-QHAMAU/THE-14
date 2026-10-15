'use client'

import { useMemo, useState } from 'react'
import {
  ALL_TYPES,
  CATEGORIES,
  CATEGORY_GROUPS,
  GAME_TYPES,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  PICKABLE_CATEGORIES,
  TIMER_OPTIONS,
  buildPool,
  countQuestions,
  type Category,
  type CategoryGroup,
  type GameSettings,
  type QuestionType,
} from '@/lib/game/questions'
import { cn } from '@/lib/utils'

export const DEFAULT_SETTINGS: GameSettings = {
  categories: ['general', 'movies', 'football', 'africa'],
  types: ['choice', 'truefalse', 'emoji', 'closest'],
  timer: 20,
  questionCount: 12,
}

export function poolSize(settings: GameSettings) {
  return buildPool(settings).length
}

interface Props {
  settings: GameSettings
  onChange: (s: GameSettings) => void
}

function Chip({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-xl border text-left transition-colors',
        active ? 'border-stone-200 bg-stone-100 text-stone-900' : 'border-stone-700 text-stone-300 hover:border-stone-500',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function GameSetup({ settings, onChange }: Props) {
  const [group, setGroup] = useState<CategoryGroup>('brain')
  const pool = useMemo(() => poolSize(settings), [settings])
  const maxQ = Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, pool))
  const count = Math.min(settings.questionCount, maxQ)

  const set = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch })
  const toggleCat = (c: Category) =>
    set({ categories: settings.categories.includes(c) ? settings.categories.filter((x) => x !== c) : [...settings.categories, c] })
  const toggleType = (t: QuestionType) =>
    set({ types: settings.types.includes(t) ? settings.types.filter((x) => x !== t) : [...settings.types, t] })

  const groupCats = PICKABLE_CATEGORIES.filter((c) => CATEGORIES[c].group === group)
  const allSelected = settings.categories.length === PICKABLE_CATEGORIES.length
  const selectedInGroup = (g: CategoryGroup) => settings.categories.filter((c) => CATEGORIES[c].group === g).length
  const groupFull = groupCats.every((c) => settings.categories.includes(c))

  return (
    <div className="space-y-8">
      {/* Categories */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-stone-400">Categories</h2>
          <button
            type="button"
            onClick={() => set({ categories: allSelected ? [] : [...PICKABLE_CATEGORIES] })}
            className="text-xs text-stone-400 underline underline-offset-4 hover:text-stone-200"
          >
            {allSelected ? 'Clear all' : 'Surprise me (all)'}
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist">
          {CATEGORY_GROUPS.map((g) => {
            const n = selectedInGroup(g.id)
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={group === g.id}
                onClick={() => setGroup(g.id)}
                className={cn(
                  'flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors',
                  group === g.id ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-200',
                )}
              >
                {g.label}
                {n > 0 && <span className={cn('ml-1.5 text-xs', group === g.id ? 'text-stone-500' : 'text-stone-500')}>{n}</span>}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {groupCats.map((c) => {
            const info = CATEGORIES[c]
            const active = settings.categories.includes(c)
            return (
              <Chip key={c} active={active} onClick={() => toggleCat(c)} className="p-3 flex items-center gap-2.5">
                <span className="text-lg">{info.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-sm leading-tight truncate">{info.label}</span>
                  <span className={cn('block text-[11px]', active ? 'text-stone-500' : 'text-stone-500')}>{countQuestions(c)} questions</span>
                </span>
              </Chip>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() =>
            set({
              categories: groupFull
                ? settings.categories.filter((c) => !groupCats.includes(c))
                : [...new Set([...settings.categories, ...groupCats])],
            })
          }
          className="text-xs text-stone-500 hover:text-stone-300"
        >
          {groupFull ? 'Deselect this group' : 'Select this whole group'}
        </button>
      </section>

      {/* Game types */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-stone-400">Game types</h2>
        <div className="grid gap-2">
          {ALL_TYPES.map((t) => {
            const info = GAME_TYPES[t]
            const active = settings.types.includes(t)
            return (
              <Chip key={t} active={active} onClick={() => toggleType(t)} className="p-3 flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center text-[10px]',
                    active ? 'bg-stone-900 border-stone-900 text-stone-50' : 'border-stone-600',
                  )}
                >
                  {active ? '✓' : ''}
                </span>
                <span>
                  <span className="block text-sm">
                    {info.label}
                    {info.party && <span className="ml-2 text-[10px] uppercase tracking-wider text-stone-500">Party</span>}
                  </span>
                  <span className="block text-xs text-stone-500">{info.description}</span>
                </span>
              </Chip>
            )
          })}
        </div>
      </section>

      {/* Length and timer */}
      <section className="grid gap-6">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs uppercase tracking-widest text-stone-400">Questions</h2>
            <span className="font-mono text-stone-200">{count}</span>
          </div>
          <input
            type="range"
            min={MIN_QUESTIONS}
            max={maxQ}
            value={count}
            onChange={(e) => set({ questionCount: Number(e.target.value) })}
            disabled={pool < MIN_QUESTIONS}
            className="w-full range-dark"
            aria-label="Number of questions"
          />
          <p className="text-xs text-stone-500">
            {pool < MIN_QUESTIONS
              ? 'Not enough questions. Add a category or game type.'
              : `${pool} questions match this setup.`}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-stone-400">Time per question</h2>
          <div className="flex rounded-xl border border-stone-700 p-1">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ timer: t })}
                className={cn('flex-1 rounded-lg py-1.5 text-sm transition-colors', settings.timer === t ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-200')}
              >
                {t}s
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-500">Order, Closest and Bluff rounds get a little extra.</p>
        </div>
      </section>
    </div>
  )
}
