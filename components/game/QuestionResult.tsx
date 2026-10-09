
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
  timeTakenMs?: number | null
}

function getResultReaction(
  selectedOption: number | null,
  correctOption: number,
  timeTakenMs?: number | null,
): string {
  if (selectedOption === null) return 'Missed.'
  if (selectedOption !== correctOption) return 'Wrong.'
  if (timeTakenMs == null) return 'Correct.'
  if (timeTakenMs < 3000) return 'First.'
  if (timeTakenMs < 7000) return 'Fast.'
  return 'Correct.'
}

export function QuestionResult({
  question,
  selectedOption,
  pointsEarned,
  answerStats,
  myRank,
  totalPlayers,
  myScore,
  timeTakenMs,
}: Props) {
  const [step, setStep] = useState(0)
  const isCorrect = selectedOption === question.correct
  const optionLabels = ['A', 'B', 'C', 'D']

  const reaction = getResultReaction(
    selectedOption,
    question.correct,
    timeTakenMs,
  )

  useEffect(() => {
    setStep(0)

    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 900),
      setTimeout(() => setStep(3), 1900),
    ]

    return () => timers.forEach(clearTimeout)
  }, [question.id])

  return (
    <main className="min-h-screen flex flex-col px-4 py-8 bg-stone-50">
      <div className="max-w-sm mx-auto w-full space-y-6">

        <div
          className={`p-5 text-center transition-opacity duration-500 ${
            step >= 1 ? 'opacity-100' : 'opacity-0'
          } ${
            isCorrect
              ? 'bg-stone-900 text-stone-50'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          <p className="text-sm font-medium">{reaction}</p>

          {pointsEarned > 0 && (
            <p className="text-xs mt-2 opacity-70">
              +{pointsEarned} points
            </p>
          )}
        </div>

        {step >= 1 && (
          <section className="space-y-1">
            <p className="text-xs text-stone-400 uppercase tracking-widest">
              Correct answer
            </p>

            <div className="flex items-center gap-3 p-3 bg-stone-900 text-stone-50">
              <span className="w-6 h-6 flex items-center justify-center text-xs font-bold border border-stone-50">
                {optionLabels[question.correct]}
              </span>
              <span className="text-sm">
                {question.options[question.correct]}
              </span>
            </div>
          </section>
        )}

        <section
          className={`space-y-3 transition-opacity duration-300 ${
            step >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={step < 2}
        >
          <p className="text-xs text-stone-400 uppercase tracking-widest">
            How everyone answered
          </p>

          {question.options.map((option, index) => {
            const stat = answerStats.find(
              (item) => item.optionIndex === index,
            )
            const percentage = Math.max(
              0,
              Math.min(100, stat?.percentage ?? 0),
            )
            const correct = index === question.correct

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span
                    className={`min-w-0 ${
                      correct
                        ? 'text-stone-900 font-medium'
                        : 'text-stone-500'
                    }`}
                  >
                    {optionLabels[index]}. {option}
                  </span>

                  <span className="text-stone-400 font-mono flex-shrink-0">
                    {Math.round(percentage)}%
                  </span>
                </div>

                <div className="h-1.5 bg-stone-100 w-full overflow-hidden">
                  <div
                    className={`h-full ${
                      correct ? 'bg-stone-900' : 'bg-stone-300'
                    } transition-transform duration-500 ease-out motion-reduce:transition-none`}
                    style={{
                      width: `${percentage}%`,
                      transform:
                        step >= 2 ? 'translateX(0)' : 'translateX(-100%)',
                      transitionDelay:
                        step >= 2 ? `${index * 150}ms` : '0ms',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </section>

        {step >= 3 && (
          <section className="border-t border-stone-200 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest">
                Your score
              </p>
              <p className="text-2xl font-light text-stone-900">
                {myScore}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-stone-400 uppercase tracking-widest">
                Rank
              </p>
              <p className="text-2xl font-light text-stone-900">
                {myRank}{' '}
                <span className="text-sm text-stone-400">
                  / {totalPlayers}
                </span>
              </p>
            </div>
          </section>
        )}

        {step >= 3 && (
          <p className="text-xs text-stone-400 text-center">
            Waiting for Game Master.
          </p>
        )}
      </div>
    </main>
  )
}
