
'use client'

import { useEffect, useState } from 'react'
import { AvatarDisplay } from '@/components/ui/Avatar'

interface ScoreEntry {
  player_id: string
  name: string
  avatar: string
  total: number
}

interface Props {
  scores: ScoreEntry[]
  myPlayerId: string
}

export function Podium({ scores, myPlayerId }: Props) {
  const [step, setStep] = useState(0)

  const sorted = [...scores].sort((a, b) => b.total - a.total)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  const podiumOrder = [top3[1], top3[0], top3[2]].filter(
    (entry): entry is ScoreEntry => Boolean(entry),
  )

  const podiumHeights = ['h-24', 'h-32', 'h-16']
  const podiumPositions = [1, 0, 2]

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1100),
      setTimeout(() => setStep(3), 1900),
      setTimeout(() => setStep(4), 2600),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <main className="min-h-screen bg-stone-900 text-stone-50 flex flex-col px-4 py-10">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-10">

        <header
          className={`transition-all duration-500 ${
            step >= 1
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-xs tracking-widest uppercase text-stone-500">
            Game over
          </p>
          <h1 className="text-3xl font-light mt-1">THE 14</h1>
        </header>

        {step >= 2 && podiumOrder.length > 0 && (
          <section
            className="flex items-end justify-center gap-3"
            aria-label="Top three players"
          >
            {podiumOrder.map((entry, displayIdx) => {
              const rank = podiumPositions[displayIdx] + 1
              const isMe = entry.player_id === myPlayerId

              return (
                <div
                  key={entry.player_id}
                  className="flex flex-col items-center gap-2 min-w-0"
                  style={{
                    animation: 'none',
                    transitionDelay: `${displayIdx * 150}ms`,
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs tracking-widest text-stone-500">
                      {rank === 1
                        ? '1ST'
                        : rank === 2
                          ? '2ND'
                          : '3RD'}
                    </span>

                    <AvatarDisplay avatarId={entry.avatar} size="lg" />

                    <p
                      className={`text-xs font-medium text-center max-w-[72px] truncate ${
                        isMe ? 'text-stone-100' : 'text-stone-400'
                      }`}
                    >
                      {entry.name}
                      {isMe && (
                        <span className="block text-stone-500 text-[10px]">
                          You
                        </span>
                      )}
                    </p>

                    <p className="text-sm font-mono text-stone-300">
                      {entry.total}
                    </p>
                  </div>

                  <div
                    className={`w-20 flex items-center justify-center ${
                      podiumHeights[displayIdx]
                    } ${
                      rank === 1
                        ? 'bg-stone-200 text-stone-900'
                        : rank === 2
                          ? 'bg-stone-700 text-stone-300'
                          : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <span className="text-lg font-light">{rank}</span>
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {step >= 3 && rest.length > 0 && (
          <section className="space-y-px">
            <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">
              Final standings
            </p>

            {rest.map((entry, index) => {
              const isMe = entry.player_id === myPlayerId

              return (
                <div
                  key={entry.player_id}
                  className={`flex items-center justify-between gap-3 py-2.5 px-3 ${
                    isMe ? 'bg-stone-800' : 'bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-stone-500 w-4">
                      {index + 4}
                    </span>

                    <AvatarDisplay avatarId={entry.avatar} size="sm" />

                    <span className="text-sm text-stone-300 truncate">
                      {entry.name}
                      {isMe && (
                        <span className="text-stone-500 ml-1 text-xs">
                          (you)
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="font-mono text-sm text-stone-400">
                    {entry.total}
                  </span>
                </div>
              )
            })}
          </section>
        )}

        {step >= 4 && (
          <p className="text-xs text-stone-500 text-center border-t border-stone-800 pt-5">
            Final standings.
          </p>
        )}
      </div>
    </main>
  )
}
