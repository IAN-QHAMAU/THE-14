'use client'
import { useState, useEffect } from 'react'
import type { PlayerRole } from '@/types'

interface ScoreEntry {
  player_id: string
  name: string
  total: number
}

interface Props {
  scores: ScoreEntry[]
  myPlayerId: string
  myRole: PlayerRole | null
}

export function FinalResults({ scores, myPlayerId, myRole }: Props) {
  const [step, setStep] = useState(0)
  const sorted = [...scores].sort((a, b) => b.total - a.total)
  const myScore = scores.find((s) => s.player_id === myPlayerId)
  const myRank = sorted.findIndex((s) => s.player_id === myPlayerId) + 1

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <main className="min-h-screen bg-stone-900 text-stone-50 flex flex-col px-6 py-12">
      <div className="max-w-sm mx-auto w-full space-y-10">

        <div>
          <p className="text-xs tracking-widest uppercase text-stone-500">The game is over.</p>
          <h1 className="text-3xl font-light mt-1">THE 14</h1>
        </div>

        {/* My reveal */}
        {step >= 1 && myRole && (
          <div className="space-y-4 border-l-2 border-stone-700 pl-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-500">You were</p>
              <p className="text-lg font-medium text-stone-100 mt-0.5">{myRole.role_name}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-500">Your objective was</p>
              <p className="text-sm text-stone-300 mt-0.5 leading-relaxed">{myRole.secret_objective}</p>
            </div>
            {myScore && (
              <div>
                <p className="text-xs tracking-widest uppercase text-stone-500">Your score</p>
                <p className="text-3xl font-light text-stone-100 mt-0.5">{myScore.total}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ranked {myRank} of {scores.length}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Final standings */}
        {step >= 2 && (
          <div className="space-y-2">
            <p className="text-xs tracking-widest uppercase text-stone-500">Final Standings</p>
            <div className="space-y-px">
              {sorted.map((entry, i) => (
                <div
                  key={entry.player_id}
                  className={`flex items-center justify-between py-3 px-4 ${
                    entry.player_id === myPlayerId
                      ? 'bg-stone-800 border-l-2 border-stone-400'
                      : 'bg-stone-800/40 border-l-2 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-500 w-4">{i + 1}</span>
                    <span className="text-sm text-stone-200">
                      {entry.name}
                      {entry.player_id === myPlayerId && (
                        <span className="ml-1 text-stone-500"> (you)</span>
                      )}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-stone-300">{entry.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="border-t border-stone-800 pt-6">
            <p className="text-xs text-stone-600 leading-relaxed">
              Every player had a private objective. Some worked together without knowing it.
              Some worked against people they trusted.
              The outcome was shaped by information no single person fully possessed.
            </p>
          </div>
        )}

        {step < 3 && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-600 animate-pulse" />
            <p className="text-xs text-stone-500">Revealing…</p>
          </div>
        )}
      </div>
    </main>
  )
}
