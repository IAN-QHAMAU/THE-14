'use client'
import { useEffect, useState } from 'react'

interface CountdownProps {
  endsAt: string
  onExpire?: () => void
}

export function Countdown({ endsAt, onExpire }: CountdownProps) {
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
      setSecs(diff)
      if (diff === 0) onExpire?.()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt, onExpire])

  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  const urgent = secs <= 15

  return (
    <span
      className={`font-mono text-2xl tabular-nums transition-colors duration-300 ${
        urgent ? 'text-red-600' : 'text-stone-400'
      }`}
    >
      {m}:{s}
    </span>
  )
}
