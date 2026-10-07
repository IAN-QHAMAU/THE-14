'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function GMPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game/create', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not create game.'); return }
      setCode(data.gameCode)
      router.push('/gm/control')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-10">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-stone-900">THE 14</h1>
          <p className="mt-1 text-xs text-stone-400 tracking-widest uppercase">Game Master</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            Create a new game. You'll receive a 5-letter code to share with your 14 players.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {code && (
            <div className="p-4 bg-stone-900 text-stone-50">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Game Code</p>
              <p className="text-3xl font-mono tracking-widest">{code}</p>
            </div>
          )}
          <Button size="lg" onClick={handleCreate} loading={loading}>
            CREATE NEW GAME
          </Button>
        </div>

        <div className="border-t border-stone-100 pt-6">
          <button
            onClick={() => router.push('/join')}
            className="text-xs text-stone-400 underline underline-offset-4 hover:text-stone-700 transition-colors"
          >
            Join as a player instead
          </button>
        </div>
      </div>
    </main>
  )
}
