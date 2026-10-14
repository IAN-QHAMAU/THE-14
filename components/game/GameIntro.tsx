'use client'

import { CATEGORIES, GAME_TYPES, PICKABLE_CATEGORIES, type Category, type QuestionType } from '@/lib/game/questions/schema'
import { cn } from '@/lib/utils'
import type { Game } from '@/types'

/** Shown after the host starts the game, before question one. */
export function GameIntro({ game, size = 'phone' }: { game: Game; size?: 'phone' | 'stage' }) {
  const stage = size === 'stage'
  const cats = (game.settings?.categories ?? []) as Category[]
  const types = (game.settings?.types ?? []) as QuestionType[]
  const allCats = cats.length >= PICKABLE_CATEGORIES.length

  return (
    <div className={cn('w-full mx-auto text-center flex flex-col items-center gap-8', stage ? 'max-w-3xl' : 'max-w-sm')}>
      <div className="space-y-2 animate-fade-up">
        <p className="text-xs tracking-widest uppercase text-stone-500">The lineup</p>
        <h1 className={cn('font-light text-stone-50', stage ? 'text-6xl' : 'text-4xl')}>
          {cats.length === 1 ? `${CATEGORIES[cats[0]].emoji} ${CATEGORIES[cats[0]].label}` : allCats ? 'Everything' : 'The Mix'}
        </h1>
        <p className={cn('text-stone-400', stage ? 'text-lg' : 'text-sm')}>
          {game.total_questions} questions · {game.settings?.timer ?? 20}s each · speed counts
        </p>
      </div>

      {cats.length > 1 && !allCats && (
        <div className="flex flex-wrap justify-center gap-1.5 animate-fade-up" style={{ animationDelay: '150ms' }}>
          {cats.map((c) => (
            <span key={c} className={cn('rounded-full bg-stone-800 text-stone-300', stage ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-xs')}>
              {CATEGORIES[c].emoji} {CATEGORIES[c].label}
            </span>
          ))}
        </div>
      )}

      {types.length > 1 && (
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <p className="text-xs tracking-widest uppercase text-stone-500">Rounds include</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {types.map((t) => (
              <span key={t} className={cn('rounded-full border border-stone-700 text-stone-400', stage ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-xs')}>
                {GAME_TYPES[t].label}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-stone-500 animate-fade-in" style={{ animationDelay: '600ms' }}>
        Starting soon.
      </p>
    </div>
  )
}
