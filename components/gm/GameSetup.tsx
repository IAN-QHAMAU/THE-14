'use client'

import { useMemo, useState } from 'react'
import {
  ALL_TYPES,
  CATEGORIES,
  CATEGORY_GROUPS,
  GAME_TYPES,
  GROUP_TINT,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  PICKABLE_CATEGORIES,
  TIMER_OPTIONS,
  buildPool,
  maxGameLength,
  difficultyOf,
  DIFFICULTY_SETTINGS,
  countQuestions,
  type Category,
  type CategoryGroup,
  type GameSettings,
  type QuestionType,
} from '@/lib/game/questions'
import { cn } from '@/lib/utils'

/** How long a game these settings can make (a chosen level is strict). */
export function poolSize(settings: GameSettings) {
  return maxGameLength(settings)
}

/** Ready made games, so a host can start in one tap. */
const PRESETS: { id: string; title: string; blurb: string; settings: GameSettings }[] = [
  {
    id: 'quick',
    title: 'Quick Round',
    blurb: '10 mixed questions. About five minutes.',
    settings: {
      categories: ['general', 'movies', 'music', 'football', 'kenya', 'animals', 'food'],
      types: ['choice', 'truefalse', 'emoji', 'oddone'],
      timer: 20,
      questionCount: 10,
      difficulty: 'mixed',
      finalWager: false,
    },
  },
  {
    id: 'party',
    title: 'Party Night',
    blurb: 'Quiz mixed with party rounds, then a Final Wager.',
    settings: {
      categories: ['movies', 'music', 'internet', 'afromusic', 'hiphop', 'series', 'football', 'kenya', 'food', 'throwback'],
      types: ['choice', 'emoji', 'oddone', 'fastest', 'bluff', 'mostlikely', 'sync', 'sketch'],
      timer: 20,
      questionCount: 15,
      difficulty: 'mixed',
      finalWager: true,
    },
  },
  {
    id: 'brain',
    title: 'Brain Battle',
    blurb: 'Hard questions only. No party rounds.',
    settings: {
      categories: PICKABLE_CATEGORIES.filter((c) => CATEGORIES[c].group === 'brain'),
      types: ['choice', 'truefalse', 'closest', 'order', 'oddone', 'fastest'],
      timer: 20,
      questionCount: 15,
      difficulty: 'hard',
      finalWager: true,
    },
  },
]

/** New hosts start on Quick Round. */
export const DEFAULT_SETTINGS: GameSettings = PRESETS[0].settings

const STEPS = ['Start', 'Categories', 'Modes', 'Rules'] as const
type Step = (typeof STEPS)[number]

/** One line that sums up the game, shown next to the Start button. */
export function setupSummary(settings: GameSettings, count: number) {
  const level = DIFFICULTY_SETTINGS.find((d) => d.id === (settings.difficulty ?? 'mixed'))?.label ?? 'Mixed'
  return [
    `${count} questions`,
    level,
    `${settings.timer}s`,
    settings.finalWager ? 'Final Wager' : null,
    settings.teams ? 'Teams' : null,
    settings.powerUps ? 'Power-ups' : null,
  ].filter(Boolean).join(' · ')
}

interface Props {
  settings: GameSettings
  onChange: (s: GameSettings) => void
}

/** A switch card for the extras. */
function Toggle({ on, onClick, title, text }: { on: boolean; onClick: () => void; title: string; text: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn('w-full rounded-2xl border p-4 text-left transition-colors', on ? 'border-accent-line bg-accent-soft' : 'border-stone-800 bg-stone-800/40 hover:border-stone-600')}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-base text-stone-100">{title}</span>
        <span className={cn('w-9 h-5 rounded-full relative transition-colors flex-shrink-0', on ? 'bg-accent' : 'bg-stone-700')}>
          <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', on ? 'left-[18px]' : 'left-0.5')} />
        </span>
      </span>
      <span className="block mt-1 text-sm text-stone-400">{text}</span>
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{children}</h2>
}

export function GameSetup({ settings, onChange }: Props) {
  const [step, setStep] = useState<Step>('Start')
  const [group, setGroup] = useState<CategoryGroup>('brain')
  const poolList = useMemo(() => buildPool(settings), [settings])
  const pool = useMemo(() => poolSize(settings), [settings])
  const levels = useMemo(() => {
    const c = { easy: 0, medium: 0, hard: 0 }
    for (const q of poolList) if (!GAME_TYPES[q.type].party) c[difficultyOf(q)]++
    return c
  }, [poolList])
  const maxQ = Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, pool))
  const count = Math.min(settings.questionCount, maxQ)

  const set = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch })
  const toggleCat = (c: Category) =>
    set({ categories: settings.categories.includes(c) ? settings.categories.filter((x) => x !== c) : [...settings.categories, c] })
  const toggleType = (t: QuestionType) =>
    set({ types: settings.types.includes(t) ? settings.types.filter((x) => x !== t) : [...settings.types, t] })

  const same = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((x) => b.includes(x))
  const activePreset = PRESETS.find(
    (p) =>
      same(p.settings.categories, settings.categories) &&
      same(p.settings.types, settings.types) &&
      p.settings.questionCount === settings.questionCount &&
      p.settings.difficulty === settings.difficulty &&
      Boolean(p.settings.finalWager) === Boolean(settings.finalWager),
  )

  const groupCats = PICKABLE_CATEGORIES.filter((c) => CATEGORIES[c].group === group)
  const allSelected = settings.categories.length === PICKABLE_CATEGORIES.length
  const selectedInGroup = (g: CategoryGroup) => settings.categories.filter((c) => CATEGORIES[c].group === g).length
  const groupFull = groupCats.every((c) => settings.categories.includes(c))
  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="space-y-6">
      {/* Steps */}
      <nav className="space-y-3" aria-label="Game setup">
        <div className="grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => (
            <button key={s} type="button" onClick={() => setStep(s)} className="group text-left space-y-1.5" aria-current={step === s ? 'step' : undefined}>
              <span className={cn('block h-1 rounded-full transition-colors', i <= stepIndex ? 'bg-accent' : 'bg-stone-800 group-hover:bg-stone-700')} />
              <span className={cn('block text-xs transition-colors', step === s ? 'text-stone-100' : 'text-stone-500 group-hover:text-stone-300')}>{s}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Start: presets */}
      {step === 'Start' && (
        <section className="space-y-3 animate-fade-up">
          <Label>Pick a game</Label>
          <div className="grid gap-2">
            {PRESETS.map((p) => {
              const active = activePreset?.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange({ ...settings, ...p.settings })}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all',
                    active ? 'border-accent-line bg-accent-soft' : 'border-stone-800 bg-stone-800/40 hover:border-stone-600',
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-base text-stone-100">{p.title}</span>
                    <span className={cn('w-4 h-4 rounded-full border flex-shrink-0 transition-colors', active ? 'border-accent bg-accent' : 'border-stone-600')} />
                  </span>
                  <span className="block mt-1 text-sm text-stone-400">{p.blurb}</span>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setStep('Categories')}
            className={cn(
              'w-full rounded-2xl border border-dashed p-4 text-left transition-colors',
              !activePreset ? 'border-accent-line text-stone-100' : 'border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500',
            )}
          >
            <span className="block text-base">{activePreset ? 'Build your own' : 'Your own mix'}</span>
            <span className="block mt-1 text-sm text-stone-500">Choose categories, modes and rules yourself.</span>
          </button>
        </section>
      )}

      {/* Categories */}
      {step === 'Categories' && (
        <section className="space-y-3 animate-fade-up">
          <div className="flex items-center justify-between">
            <Label>Categories</Label>
            <button
              type="button"
              onClick={() => set({ categories: allSelected ? [] : [...PICKABLE_CATEGORIES] })}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5" role="tablist">
            {CATEGORY_GROUPS.map((g) => {
              const n = selectedInGroup(g.id)
              const on = group === g.id
              return (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setGroup(g.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                    on ? 'border-stone-500 bg-stone-800 text-stone-100' : 'border-transparent text-stone-400 hover:text-stone-200',
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GROUP_TINT[g.id] }} />
                  {g.label}
                  {n > 0 && <span className="text-xs text-stone-500">{n}</span>}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {groupCats.map((c) => {
              const info = CATEGORIES[c]
              const active = settings.categories.includes(c)
              const tint = GROUP_TINT[group]
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCat(c)}
                  aria-pressed={active}
                  className={cn(
                    'relative rounded-xl border p-3 text-left transition-colors flex items-start gap-2.5',
                    active ? 'text-stone-50' : 'border-stone-800 bg-stone-800/40 text-stone-300 hover:border-stone-600',
                  )}
                  style={active ? { borderColor: `${tint}80`, backgroundColor: `${tint}1f` } : undefined}
                >
                  <span className="text-lg leading-none mt-0.5">{info.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug line-clamp-2">{info.label}</span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">{countQuestions(c)} questions</span>
                  </span>
                  {active && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-stone-900" style={{ backgroundColor: tint }}>
                      ✓
                    </span>
                  )}
                </button>
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
      )}

      {/* Modes */}
      {step === 'Modes' && (
        <section className="space-y-5 animate-fade-up">
          {[
            { label: 'Quiz modes', types: ALL_TYPES.filter((t) => !GAME_TYPES[t].party) },
            { label: 'Party modes', types: ALL_TYPES.filter((t) => GAME_TYPES[t].party) },
          ].map((block) => (
            <div key={block.label} className="space-y-2">
              <Label>{block.label}</Label>
              <div className="grid gap-2">
                {block.types.map((t) => {
                  const info = GAME_TYPES[t]
                  const active = settings.types.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleType(t)}
                      aria-pressed={active}
                      className={cn(
                        'rounded-xl border p-3 text-left flex items-start gap-3 transition-colors',
                        active ? 'border-accent-line bg-accent-soft' : 'border-stone-800 bg-stone-800/40 hover:border-stone-600',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center text-[10px] transition-colors',
                          active ? 'bg-accent border-accent text-accent-ink' : 'border-stone-600',
                        )}
                      >
                        {active ? '✓' : ''}
                      </span>
                      <span>
                        <span className={cn('block text-sm', active ? 'text-stone-50' : 'text-stone-200')}>{info.label}</span>
                        <span className="block text-xs text-stone-500">{info.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Rules */}
      {step === 'Rules' && (
        <section className="space-y-6 animate-fade-up">
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {DIFFICULTY_SETTINGS.map((d) => {
                const active = (settings.difficulty ?? 'mixed') === d.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => set({ difficulty: d.id })}
                    aria-pressed={active}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-sm transition-colors',
                      active ? 'border-accent-line bg-accent-soft text-stone-50' : 'border-stone-800 bg-stone-800/40 text-stone-300 hover:border-stone-600',
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-stone-500">
              {DIFFICULTY_SETTINGS.find((d) => d.id === (settings.difficulty ?? 'mixed'))?.hint} Your picks have {levels.easy} easy, {levels.medium} medium and {levels.hard} hard questions.
              {['easy', 'medium', 'hard'].includes(settings.difficulty ?? 'mixed') && ' Only that level is used, so add categories if the game comes out short.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Questions</Label>
              <span className="font-mono text-stone-100">{count}</span>
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
              {pool < MIN_QUESTIONS ? 'Not enough questions. Add a category or mode.' : `Up to ${pool} questions with this setup.`}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Time per question</Label>
            <div className="flex rounded-xl border border-stone-800 bg-stone-800/40 p-1">
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

          <div className="space-y-2">
            <Label>Extras</Label>
            <Toggle
              on={settings.finalWager === true}
              onClick={() => set({ finalWager: !settings.finalWager })}
              title="Final Wager"
              text="The last question is a bet. Everyone stakes up to half their points before seeing it."
            />
            <Toggle
              on={settings.teams === true}
              onClick={() => set({ teams: !settings.teams })}
              title="Team Battle"
              text="Players pick Team Amber or Team Teal in the lobby. The team with the higher average wins."
            />
            <Toggle
              on={settings.powerUps === true}
              onClick={() => set({ powerUps: !settings.powerUps })}
              title="Power-ups"
              text="Three right in a row earns a card: Freeze, Steal, Shuffle, Shield or Double Down."
            />
          </div>
        </section>
      )}

      {/* Back and next */}
      <div className="flex items-center justify-between pt-1">
        {stepIndex > 0 ? (
          <button type="button" onClick={() => setStep(STEPS[stepIndex - 1])} className="text-sm text-stone-500 hover:text-stone-300">
            Back
          </button>
        ) : (
          <span />
        )}
        {stepIndex < STEPS.length - 1 && (
          <button
            type="button"
            onClick={() => setStep(STEPS[stepIndex + 1])}
            className="rounded-full border border-stone-700 px-4 py-1.5 text-sm text-stone-200 hover:border-stone-500"
          >
            {stepIndex === 0 && activePreset ? 'Fine tune' : `Next: ${STEPS[stepIndex + 1]}`}
          </button>
        )}
      </div>
    </div>
  )
}
