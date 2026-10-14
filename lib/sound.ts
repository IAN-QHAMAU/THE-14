'use client'
import { useEffect, useState } from 'react'

// Small synthesized sounds, no audio files. Soft sine tones so nothing is harsh.

const KEY = 'the14_muted'
let ctx: AudioContext | null = null
let muted = false
const listeners = new Set<(m: boolean) => void>()

try {
  muted = typeof window !== 'undefined' && window.localStorage.getItem(KEY) === '1'
} catch {
  muted = false
}

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, volume = 0.08, type: OscillatorType = 'sine') {
  const a = audio()
  if (!a || muted) return
  const t = a.currentTime + start
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

function buzz(pattern: number | number[]) {
  if (muted) return
  // Browsers only allow vibration after the user has tapped the page.
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
  if (activation && !activation.hasBeenActive) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Not supported on this device.
  }
}

export const sound = {
  /** Call from a tap so mobile browsers allow audio later. */
  unlock() {
    audio()
  },
  tap() {
    tone(660, 0, 0.08, 0.05)
    buzz(15)
  },
  tick() {
    tone(880, 0, 0.06, 0.035)
  },
  count() {
    tone(520, 0, 0.12, 0.06)
  },
  go() {
    tone(780, 0, 0.18, 0.07)
    buzz(30)
  },
  correct() {
    tone(660, 0, 0.14)
    tone(880, 0.1, 0.22)
    buzz([20, 40, 20])
  },
  wrong() {
    tone(320, 0, 0.18, 0.07, 'triangle')
    tone(240, 0.12, 0.26, 0.06, 'triangle')
    buzz(120)
  },
  reveal() {
    tone(440, 0, 0.12, 0.05)
    tone(550, 0.08, 0.16, 0.05)
  },
  fanfare() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.3, 0.06))
    buzz([30, 60, 30, 60, 60])
  },
}

export function setMuted(m: boolean) {
  muted = m
  try {
    window.localStorage.setItem(KEY, m ? '1' : '0')
  } catch {
    // Storage blocked, keep it in memory only.
  }
  listeners.forEach((l) => l(m))
}

export function useMuted(): [boolean, (m: boolean) => void] {
  const [m, setM] = useState(false)
  useEffect(() => {
    setM(muted)
    listeners.add(setM)
    return () => {
      listeners.delete(setM)
    }
  }, [])
  return [m, setMuted]
}
