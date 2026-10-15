'use client'
import { useEffect, useState } from 'react'

// Chrome, Edge and Samsung Internet fire `beforeinstallprompt` once the app is
// installable. It can fire before any React component mounts, so we listen
// as soon as this module loads and keep the event for later.

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: InstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferred = null
    notify()
  })
}

export type Platform = 'ios' | 'android' | 'desktop'

export interface InstallState {
  /** Already running as an installed app. */
  standalone: boolean
  /** One tap install is available (Chrome, Edge, Samsung). */
  canPrompt: boolean
  /** Opened inside WhatsApp, Instagram and similar, where install is impossible. */
  inAppBrowser: boolean
  /** iPhone or iPad in a browser other than Safari (cannot add to home screen reliably). */
  iosNotSafari: boolean
  platform: Platform
  installed: boolean
}

function detect(): InstallState {
  const ua = navigator.userAgent
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const android = /Android/i.test(ua)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  const inAppBrowser = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Snapchat|TikTok|musical_ly|Line\/|Twitter|LinkedInApp|; wv\)/i.test(ua)
  const iosNotSafari = ios && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
  return {
    standalone,
    canPrompt: Boolean(deferred),
    inAppBrowser,
    iosNotSafari,
    platform: ios ? 'ios' : android ? 'android' : 'desktop',
    installed,
  }
}

export function useInstall() {
  const [state, setState] = useState<InstallState | null>(null)

  useEffect(() => {
    const update = () => setState(detect())
    update()
    listeners.add(update)
    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener?.('change', update)
    return () => {
      listeners.delete(update)
      mq.removeEventListener?.('change', update)
    }
  }, [])

  async function promptInstall() {
    if (!deferred) return 'unavailable'
    const e = deferred
    deferred = null
    await e.prompt()
    const choice = await e.userChoice.catch(() => ({ outcome: 'dismissed' as const }))
    notify()
    return choice.outcome
  }

  return { state, promptInstall }
}
