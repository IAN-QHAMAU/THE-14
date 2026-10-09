
'use client'

import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, type Question } from '@/lib/game/questions'
import { Countdown } from '@/components/ui/Countdown'

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  submitted: boolean
  selectedOption: number | null
  endsAt: string
  onAnswer: (optionIndex: number) => Promise<void>
  answeredCount?: number
  eligiblePlayerCount?: number
}

function getReaction(timeTakenMs: number): string {
  if (timeTakenMs < 3000) return 'Instant.'
  if (timeTakenMs < 7000) return 'Quick.'
  if (timeTakenMs < 12000) return 'Made it.'
  if (timeTakenMs < 20000) return 'Just in time.'
  return 'Too slow.'
}

export function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  submitted,
  selectedOption,
  endsAt,
  onAnswer,
  answeredCount,
  eligiblePlayerCount,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [localSelected, setLocalSelected] =
    useState<number | null>(selectedOption)
  const [appeared, setAppeared] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)

  const startTime = useRef(Date.now())
  const cat = CATEGORIES[question.category]

  useEffect(() => {
    startTime.current = Date.now()
    setLocalSelected(selectedOption)
    setReaction(null)
    setLoading(false)
    setAppeared(false)

    const timer = setTimeout(() => setAppeared(true), 80)

    return () => clearTimeout(timer)
    // Reset the timer only when the active question changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  useEffect(() => {
    setLocalSelected(selectedOption)
  }, [selectedOption])

  useEffect(() => {
    if (submitted || localSelected !== null || reaction !== null) return

    const deadline = Date.parse(endsAt)
    if (!Number.isFinite(deadline)) return

    const remaining = deadline - Date.now()

    if (remaining <= 0) {
      setReaction('Too slow.')
      return
    }

    const timer = setTimeout(() => {
      setReaction('Too slow.')
    }, remaining)

    return () => clearTimeout(timer)
  }, [endsAt, submitted, localSelected, reaction])

  async function handleAnswer(idx: number) {
    if (submitted || loading || localSelected !== null) return

    const deadline = Date.parse(endsAt)

    if (Number.isFinite(deadline) && Date.now() >= deadline) {
      setReaction('Too slow.')
      return
    }

    const timeTakenMs = Date.now() - startTime.current

    setLocalSelected(idx)
    setReaction(getReaction(timeTakenMs))
    setLoading(true)

    try {
      await onAnswer(idx)
    } catch {
      setLocalSelected(null)
      setReaction(null)
    } finally {
      setLoading(false)
    }
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  const hasSubmissionCount =
    Number.isInteger(answeredCount) &&
    Number.isInteger(eligiblePlayerCount) &&
    answeredCount! >= 0 &&
    eligiblePlayerCount! >= 0

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col px-4 py-8">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-6 flex-1">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat.emoji}</span>
            <span className="text-xs text-stone-400 tracking-widest uppercase">
              {cat.label}
            </span>
          </div>
          <Countdown endsAt={endsAt} />
        </div>

        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 transition-all duration-300 ${
                i < questionNumber - 1
                  ? 'bg-stone-900'
                  : i === questionNumber - 1
                    ? 'bg-stone-500'
                    : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-stone-400 tracking-widest uppercase">
          Question {questionNumber} of {totalQuestions}
        </p>

        <div
          className={`transition-all duration-300 ${
            appeared
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <h2 className="text-lg font-medium text-stone-900 leading-snug">
            {question.question}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {question.points} pts · +{question.speedBonus} speed bonus
          </p>
        </div>

        <div className="flex flex-col gap-2.5 flex-1">
          {question.options.map((opt, idx) => {
            const isSelected = localSelected === idx
            const timedOut = reaction === 'Too slow.'

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswer(idx)}
                disabled={
                  submitted ||
                  loading ||
                  localSelected !== null ||
                  timedOut
                }
                className={`w-full flex items-center gap-3 p-4 border-2 text-left transition-all duration-150 active:scale-[0.98] disabled:cursor-default ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-stone-50'
                    : localSelected !== null || timedOut
                      ? 'border-stone-100 bg-stone-50 text-stone-300'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                }`}
              >
                <span
                  className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                    isSelected
                      ? 'border-stone-50 text-stone-50'
                      : localSelected !== null || timedOut
                        ? 'border-stone-200 text-stone-300'
                        : 'border-stone-300 text-stone-500'
                  }`}
                >
                  {optionLabels[idx]}
                </span>
                <span className="text-sm leading-snug">{opt}</span>
              </button>
            )
          })}
        </div>

        <div
          className="text-center py-2 space-y-2"
          aria-live="polite"
        >
          {reaction && (
            <p className="text-xs text-stone-400">{reaction}</p>
          )}

          {hasSubmissionCount && (
            <p className="text-xs text-stone-400">
              {Math.min(answeredCount!, eligiblePlayerCount!)} of{' '}
              {eligiblePlayerCount} answered
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
