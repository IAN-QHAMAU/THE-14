'use client'
import { useEffect, useState } from 'react'

// Phones and laptops rarely agree on the time. We measure the gap to the
// server on every state fetch so countdowns line up across devices.
let offset = 0
let synced = false

/**
 * NTP style offset: averages the gap on the way in and the way out, so time
 * the server spends on the request does not skew the result.
 */
export function syncClock(serverStart: number, serverEnd: number, requestStartedAt: number) {
  const received = Date.now()
  const sample = (serverStart - requestStartedAt + (serverEnd - received)) / 2
  // Smooth out jitter between samples.
  offset = !synced ? sample : offset * 0.7 + sample * 0.3
  synced = true
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
