'use client'
import { useState, useEffect } from 'react'
import type { Round, RoundAssignment } from '@/types'

interface RevealData {
  teamA: number
  teamB: number
  submissionCount: number
}

interface Props {
  round: Round
  revealData: RevealData | null
  assignment: RoundAssignment | null
}

export function RoundReveal({ round, revealData, assignment }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!revealData) return
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [revealData])

  const winnerA = (revealData?.teamA ?? 0) > (revealData?.teamB ?? 0)
  const wonMyTeam =
    assignment?.team &&
    ((assignment.team === 'A' && winnerA) || (assignment.team === 'B' && !winnerA))

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col px-6 py-12">
      <div className="max-w-sm mx-auto w-full space-y-10">
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-400">
            Round {round.round_number} Complete
          </p>
          <h2 className="text-2xl font-light text-stone-900 mt-1">{round.title}</h2>
        </div>

        {step >= 1 && revealData && (
          <div className="space-y-3 transition-opacity duration-700">
            <p className="text-xs tracking-widest uppercase text-stone-400">The group chose</p>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-5 border-2 text-center ${
                  winnerA
                    ? 'border-stone-900 bg-stone-900 text-stone-50'
                    : 'border-stone-200 bg-white text-stone-500'
                }`}
              >
                <p className="text-xs tracking-widest uppercase mb-1 opacity-70">Team A</p>
                <p className="text-4xl font-light">{revealData.teamA}</p>
              </div>
              <div
                className={`p-5 border-2 text-center ${
                  !winnerA
                    ? 'border-stone-900 bg-stone-900 text-stone-50'
                    : 'border-stone-200 bg-white text-stone-500'
                }`}
              >
                <p className="text-xs tracking-widest uppercase mb-1 opacity-70">Team B</p>
                <p className="text-4xl font-light">{revealData.teamB}</p>
              </div>
            </div>
            <p className="text-xs text-stone-400 text-right">
              {revealData.submissionCount} submissions recorded
            </p>
          </div>
        )}

        {step >= 2 && (
          <div className="border-l-2 border-stone-300 pl-4 space-y-1 transition-opacity duration-700">
            <p className="text-xs tracking-widest uppercase text-stone-400">Something to consider</p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Someone in this group secretly had a reason to push one team above 500.
              Not everyone wanted the same outcome.
            </p>
          </div>
        )}

        {step >= 3 && assignment?.team && (
          <div
            className={`p-4 border-l-4 ${
              wonMyTeam
                ? 'border-stone-900 bg-stone-900 text-stone-50'
                : 'border-stone-300 bg-white text-stone-600'
            }`}
          >
            <p className="text-xs tracking-widest uppercase opacity-60 mb-1">Your result</p>
            <p className="text-sm font-medium">
              {wonMyTeam
                ? `Team ${assignment.team} won. You may have scored a bonus.`
                : `Team ${assignment.team} did not win this round.`}
            </p>
          </div>
        )}

        {step < 3 && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
            <p className="text-xs text-stone-400">Revealing…</p>
          </div>
        )}
      </div>
    </main>
  )
}
