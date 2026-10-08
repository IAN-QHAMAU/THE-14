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

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumHeights = [top3[1] ? 'h-24' : 'h-0', 'h-32', top3[2] ? 'h-16' : 'h-0']
  const podiumPositions = [1, 0, 2] // maps display order back to rank

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => setStep(4), 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <main className="min-h-screen bg-stone-900 text-stone-50 flex flex-col px-4 py-10">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-10">

        {/* Header */}
        <div
          className={`transition-all duration-700 ${
            step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <p className="text-xs tracking-widest uppercase text-stone-500">Game over</p>
          <h1 className="text-3xl font-light mt-1">THE 14</h1>
        </div>

        {/* Podium visual */}
        {step >= 2 && (
          <div className="flex items-end justify-center gap-3">
            {podiumOrder.map((entry, displayIdx) => {
              if (!entry) return <div key={displayIdx} className="w-20" />
              const rank = podiumPositions[displayIdx] + 1
              const isMe = entry.player_id === myPlayerId
              const medals = ['🥇', '🥈', '🥉']
              const heights = [podiumHeights[displayIdx]]

              return (
                <div
                  key={entry.player_id}
                  className={`flex flex-col items-center gap-2 transition-all duration-500 ${
                    step >= 2 ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${displayIdx * 200}ms` }}
                >
                  {/* Avatar + name above podium */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{medals[rank - 1]}</span>
                    <AvatarDisplay avatarId={entry.avatar} size="lg" />
                    <p
                      className={`text-xs font-medium text-center max-w-[72px] truncate ${
                        isMe ? 'text-stone-200' : 'text-stone-400'
                      }`}
                    >
                      {entry.name}
                      {isMe && <span className="block text-stone-500 text-[10px]">you</span>}
                    </p>
                    <p className="text-sm font-mono text-stone-300">{entry.total}</p>
                  </div>

                  {/* Podium block */}
                  <div
                    className={`w-20 flex items-center justify-center ${heights[0]} ${
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
          </div>
        )}

        {/* Rest of rankings */}
        {step >= 3 && rest.length > 0 && (
          <div className="space-y-px">
            <p className="text-xs tracking-widest uppercase text-stone-600 mb-2">Everyone else</p>
            {rest.map((entry, i) => {
              const isMe = entry.player_id === myPlayerId
              return (
                <div
                  key={entry.player_id}
                  className={`flex items-center justify-between py-2.5 px-3 ${
                    isMe ? 'bg-stone-800' : 'bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-600 w-4">{i + 4}</span>
                    <AvatarDisplay avatarId={entry.avatar} size="sm" />
                    <span className="text-sm text-stone-300">
                      {entry.name}
                      {isMe && <span className="text-stone-500 ml-1 text-xs">(you)</span>}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-stone-400">{entry.total}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Closing line */}
        {step >= 4 && (
          <p className="text-xs text-stone-600 text-center leading-relaxed border-t border-stone-800 pt-6">
            Thanks for playing. Knowledge was the only weapon.
          </p>
        )}
      </div>
    </main>
  )
}
