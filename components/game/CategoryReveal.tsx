'use client'
import { useEffect, useState } from 'react'
import { CATEGORIES, type Category } from '@/lib/game/questions'

interface Props {
  category: Category
  totalQuestions: number
}

export function CategoryReveal({ category, totalQuestions }: Props) {
  const [visible, setVisible] = useState(false)
  const cat = CATEGORIES[category]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="min-h-screen bg-stone-900 text-stone-50 flex flex-col items-center justify-center px-6">
      <div
        className={`text-center space-y-6 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-xs tracking-widest uppercase text-stone-500">Tonight&apos;s category</p>
        <div className="text-7xl">{cat.emoji}</div>
        <h1 className="text-3xl font-light">{cat.label}</h1>
        <p className="text-stone-400 text-sm">{totalQuestions} questions</p>
        <div className="pt-4 space-y-1">
          <p className="text-xs text-stone-600">Correct answer = points</p>
          <p className="text-xs text-stone-600">Answer faster = speed bonus</p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-4">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-pulse" />
          <p className="text-xs text-stone-500">Waiting for the Game Master to start</p>
        </div>
      </div>
    </main>
  )
}
