'use client'
import { useEffect, useState } from 'react'

// Phones and laptops rarely agree on the time. We measure the gap to the
// server on every state fetch so countdowns line up across devices.
let offset = 0

export function syncClock(serverNow: number, requestStartedAt: number) {
  const received = Date.now()
  const rtt = received - requestStartedAt
  const sample = serverNow + rtt / 2 - received
  // Smooth out jitter between samples.
  offset = offset === 0 ? sample : offset * 0.7 + sample * 0.3
}

export function serverNow() {
  return Date.now() + offset
}

/** Re-renders on an interval and returns the current server time. */
export function useServerNow(intervalMs = 250) {
  const [now, setNow] = useState(serverNow)
  useEffect(() => {
    const id = setInterval(() => setNow(serverNow()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
