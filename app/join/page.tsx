'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AvatarPicker, AVATARS } from '@/components/ui/Avatar'

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0].id)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    setError('')
    if (!code.trim() || !name.trim()) {
      setError('Enter a game code and your name.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode: code.trim(), playerName: name.trim(), avatar }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not join.'); return }
      router.push('/room')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-stone-900">THE 14</h1>
          <p className="mt-1 text-sm text-stone-400">Kwani me hudoo!!</p>
        </div>

        <div className="space-y-5">
          <Input
            id="code"
            label="Game Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXXX"
            maxLength={5}
            autoCapitalize="characters"
            autoComplete="off"
          />
          <Input
            id="name"
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            maxLength={24}
            autoComplete="off"
          />
          <AvatarPicker selected={avatar} onSelect={setAvatar} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button size="lg" onClick={handleJoin} loading={loading}>
            JOIN GAME
          </Button>
        </div>

        <div className="border-t border-stone-100 pt-5">
          <p className="text-xs text-stone-400 text-center mb-2">Running the game?</p>
          <button
            onClick={() => router.push('/gm')}
            className="w-full text-xs text-stone-500 underline underline-offset-4 hover:text-stone-900 transition-colors"
          >
            Create a new game
          </button>
        </div>
      </div>
    </main>
  )
}
