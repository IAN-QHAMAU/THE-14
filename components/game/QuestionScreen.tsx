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
}

export function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  submitted,
  selectedOption,
  endsAt,
  onAnswer,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [localSelected, setLocalSelected] = useState<number | null>(selectedOption)
  const [appeared, setAppeared] = useState(false)
  const cat = CATEGORIES[question.category]
  const startTime = useRef(Date.now())

  useEffect(() => {
    setLocalSelected(selectedOption)
    startTime.current = Date.now()
    const t = setTimeout(() => setAppeared(true), 80)
    return () => { clearTimeout(t); setAppeared(false) }
  }, [question.id, selectedOption])

  async function handleAnswer(idx: number) {
    if (submitted || loading || localSelected !== null) return
    setLocalSelected(idx)
    setLoading(true)
    try {
      await onAnswer(idx)
    } finally {
      setLoading(false)
    }
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col px-4 py-8">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-6 flex-1">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat.emoji}</span>
            <span className="text-xs text-stone-400 tracking-widest uppercase">{cat.label}</span>
          </div>
          <Countdown endsAt={endsAt} />
        </div>

        {/* Progress dots */}
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

        {/* Question number */}
        <p className="text-xs text-stone-400 tracking-widest uppercase">
          Question {questionNumber} of {totalQuestions}
        </p>

        {/* Question */}
        <div
          className={`transition-all duration-300 ${
            appeared ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <h2 className="text-lg font-medium text-stone-900 leading-snug">{question.question}</h2>
          <p className="text-xs text-stone-400 mt-1">{question.points} pts · +{question.speedBonus} speed bonus</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5 flex-1">
          {question.options.map((opt, idx) => {
            const isSelected = localSelected === idx
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={submitted || localSelected !== null}
                className={`w-full flex items-center gap-3 p-4 border-2 text-left transition-all duration-150 active:scale-[0.98] disabled:cursor-default ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-stone-50'
                    : localSelected !== null
                    ? 'border-stone-100 bg-stone-50 text-stone-300'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                }`}
              >
                <span
                  className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                    isSelected
                      ? 'border-stone-50 text-stone-50'
                      : localSelected !== null
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

        {/* Submitted state */}
        {localSelected !== null && (
          <div className="text-center py-2">
            <p className="text-xs text-stone-400">Answer locked. Waiting for others…</p>
          </div>
        )}
      </div>
    </main>
  )
}
