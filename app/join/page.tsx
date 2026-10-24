'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AvatarPicker, defaultAvatar } from '@/components/ui/Avatar'
import { InstallApp } from '@/components/InstallApp'
import { isValidAvatar } from '@/lib/avatar'

const PROFILE_KEY = 'the14_player'

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fill in from the invite link and from this phone's last game. Done after
  // mount so server and client agree.
  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get('code')
    if (fromLink) setCode(fromLink.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))
    let saved: { name?: string; avatar?: string } = {}
    try {
      saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? '{}')
    } catch {
      saved = {}
    }
    if (saved.name) setName(saved.name)
    setAvatar(saved.avatar && isValidAvatar(saved.avatar) ? saved.avatar : defaultAvatar())
  }, [])

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
      try {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: name.trim(), avatar }))
      } catch {
        // Storage blocked, they will just type it again next time.
      }
      router.push('/room')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-stone-50 flex flex-col items-center justify-center px-6 py-10">
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
          {avatar && <AvatarPicker selected={avatar} onSelect={setAvatar} />}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button size="lg" onClick={handleJoin} loading={loading}>
            JOIN GAME
          </Button>
        </div>

        <InstallApp />

        <p className="text-xs text-stone-400 text-center">
          New here?{' '}
          <a href="/manual" className="text-stone-600 underline underline-offset-4 hover:text-stone-900">
            Read the player manual
          </a>
        </p>

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
