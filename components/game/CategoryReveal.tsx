
'use client'

import { CATEGORIES, type Category } from '@/lib/game/questions'
import { AvatarDisplay } from '@/components/ui/Avatar'

interface ScoreEntry {
  player_id: string
  name: string
  avatar: string
  total: number
}

interface Props {
  category: Category
  totalQuestions: number
  currentQuestion: number
  scores: ScoreEntry[]
}

export function CategoryReveal({
  category,
  totalQuestions,
  currentQuestion,
  scores,
}: Props) {
  const cat = CATEGORIES[category]
  const isIntro = currentQuestion === 1

  const topThree = [...scores]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-stone-900 text-stone-50 flex flex-col px-6 py-10">
      <div className="max-w-sm mx-auto w-full flex flex-col flex-1 justify-center gap-10">

        {isIntro ? (
          <section className="text-center space-y-6">
            <p className="text-xs tracking-widest uppercase text-stone-400">
              THE 14
            </p>

            <div className="text-7xl" aria-hidden="true">
              {cat.emoji}
            </div>

            <h1 className="text-3xl font-light">
              {cat.label}
            </h1>

            <p className="text-sm text-stone-400">
              {totalQuestions} questions · Speed counts
            </p>

            <p className="text-sm text-stone-400 pt-8">
              Stand by.
            </p>
          </section>
        ) : (
          <>
            <header>
              <p className="text-xs uppercase tracking-widest text-stone-400">
                Question {currentQuestion} of {totalQuestions}
              </p>

              <h1 className="text-2xl font-light mt-3">
                {cat.emoji} {cat.label}
              </h1>
            </header>

            <section className="border-t border-stone-700 pt-6">
              <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-5">
                Top 3
              </h2>

              {topThree.length > 0 ? (
                <div className="space-y-px">
                  {topThree.map((player, index) => (
                    <div
                      key={player.player_id}
                      className="flex items-center gap-3 px-3 py-4 bg-stone-800"
                    >
                      <span className="w-5 text-sm font-mono text-stone-400">
                        {index + 1}
                      </span>

                      <AvatarDisplay
                        avatarId={player.avatar}
                        size="sm"
                      />

                      <span className="flex-1 min-w-0 truncate text-sm text-stone-100">
                        {player.name}
                      </span>

                      <span className="text-sm font-mono text-stone-300">
                        {player.total}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-400">
                  Scores are coming in.
                </p>
              )}
            </section>

            <p className="text-sm text-stone-400">
              Stand by.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
