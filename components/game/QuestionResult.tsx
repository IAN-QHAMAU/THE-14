'use client'
import { useEffect, useState } from 'react'
import type { Question } from '@/lib/game/questions'

interface AnswerStat {
  optionIndex: number
  count: number
  percentage: number
}

interface Props {
  question: Question
  selectedOption: number | null
  pointsEarned: number
  answerStats: AnswerStat[]
  myRank: number
  totalPlayers: number
  myScore: number
}

export function QuestionResult({
  question,
  selectedOption,
  pointsEarned,
  answerStats,
  myRank,
  totalPlayers,
  myScore,
}: Props) {
  const [step, setStep] = useState(0)
  const isCorrect = selectedOption === question.correct
  const optionLabels = ['A', 'B', 'C', 'D']

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <main className="min-h-screen flex flex-col px-4 py-8 bg-stone-50">
      <div className="max-w-sm mx-auto w-full space-y-6">

        {/* Result header */}
        <div
          className={`p-5 text-center transition-all duration-500 ${
            step >= 1 ? 'opacity-100' : 'opacity-0'
          } ${isCorrect ? 'bg-stone-900 text-stone-50' : 'bg-stone-100 text-stone-500'}`}
        >
          <p className="text-2xl mb-1">{isCorrect ? '✓' : '✕'}</p>
          <p className="text-sm font-medium">
            {isCorrect ? 'Correct' : selectedOption === null ? 'Time\'s up' : 'Wrong answer'}
          </p>
          {pointsEarned > 0 && (
            <p className="text-xs mt-1 opacity-70">+{pointsEarned} points</p>
          )}
        </div>

        {/* Correct answer */}
        {step >= 1 && (
          <div className="space-y-1">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Correct answer</p>
            <div className="flex items-center gap-3 p-3 bg-stone-900 text-stone-50">
              <span className="w-6 h-6 flex items-center justify-center text-xs font-bold border border-stone-50">
                {optionLabels[question.correct]}
              </span>
              <span className="text-sm">{question.options[question.correct]}</span>
            </div>
          </div>
        )}

        {/* Answer distribution */}
        {step >= 2 && answerStats.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-stone-400 uppercase tracking-widest">How everyone answered</p>
            {question.options.map((opt, idx) => {
              const stat = answerStats.find((s) => s.optionIndex === idx)
              const pct = stat?.percentage ?? 0
              const isCorrectOption = idx === question.correct
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isCorrectOption ? 'text-stone-900 font-medium' : 'text-stone-500'}>
                      {optionLabels[idx]}. {opt}
                    </span>
                    <span className="text-stone-400 font-mono">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 w-full">
                    <div
                      className={`h-full transition-all duration-700 ${
                        isCorrectOption ? 'bg-stone-900' : 'bg-stone-300'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Score so far */}
        {step >= 3 && (
          <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest">Your score</p>
              <p className="text-2xl font-light text-stone-900">{myScore}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400 uppercase tracking-widest">Rank</p>
              <p className="text-2xl font-light text-stone-900">
                {myRank} <span className="text-sm text-stone-400">/ {totalPlayers}</span>
              </p>
            </div>
          </div>
        )}

        {step >= 3 && (
          <p className="text-xs text-stone-400 text-center animate-pulse">
            Waiting for Game Master to continue…
          </p>
        )}
      </div>
    </main>
  )
}
