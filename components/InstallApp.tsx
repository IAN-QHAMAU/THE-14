'use client'
import { useEffect, useState } from 'react'
import { useInstall } from '@/lib/install'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'the14_install_dismissed'
const DISMISS_DAYS = 7

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="inline w-4 h-4 -mt-0.5 mx-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Share">
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  )
}

/**
 * A calm "Get the app" card. One tap install where the browser allows it,
 * clear steps where it does not, and a nudge out of WhatsApp or Instagram
 * where installing is impossible.
 */
export function InstallApp({ className }: { className?: string }) {
  const { state, promptInstall } = useInstall()
  const [hidden, setHidden] = useState(true)
  const [steps, setSteps] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const at = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0)
      setHidden(Date.now() - at < DISMISS_DAYS * 864e5)
    } catch {
      setHidden(false)
    }
  }, [])

  if (!state || state.standalone || state.installed || hidden) return null

  const dismiss = () => {
    setHidden(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // Storage blocked, it will show again next time.
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/join')
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const browser = state.platform === 'ios' ? 'Safari' : 'Chrome'
  let body: React.ReactNode
  let action: React.ReactNode = null

  if (state.inAppBrowser || state.iosNotSafari) {
    body = state.inAppBrowser ? (
      <>Apps like WhatsApp and Instagram cannot install apps. Open this page in {browser} to install THE 14.</>
    ) : (
      <>On iPhone, apps install from Safari. Open this page in Safari to install THE 14.</>
    )
    action = (
      <button type="button" onClick={copyLink} className="rounded-lg bg-stone-900 text-stone-50 px-3.5 py-2 text-sm">
        {copied ? 'Copied' : 'Copy link'}
      </button>
    )
    if (state.inAppBrowser && state.platform !== 'ios') {
      body = (
        <>
          {body} Tap <span className="font-medium">⋮</span> at the top and choose <span className="font-medium">Open in Chrome</span>, or copy the link.
        </>
      )
    } else if (state.inAppBrowser) {
      body = (
        <>
          {body} Tap <span className="font-medium">•••</span> or the compass icon and choose <span className="font-medium">Open in Safari</span>, or copy the link.
        </>
      )
    }
  } else if (state.canPrompt) {
    body = <>Install THE 14 for full screen play and quick access from your home screen.</>
    action = (
      <button type="button" onClick={() => void promptInstall()} className="rounded-lg bg-stone-900 text-stone-50 px-4 py-2 text-sm font-medium">
        Install
      </button>
    )
  } else if (state.platform === 'ios') {
    body = steps ? (
      <ol className="space-y-1 list-decimal list-inside">
        <li>
          Tap <ShareIcon /> Share at the bottom of Safari
        </li>
        <li>
          Scroll and tap <span className="font-medium">Add to Home Screen</span>
        </li>
        <li>
          Tap <span className="font-medium">Add</span>
        </li>
      </ol>
    ) : (
      <>Add THE 14 to your home screen for full screen play.</>
    )
    if (!steps) {
      action = (
        <button type="button" onClick={() => setSteps(true)} className="rounded-lg bg-stone-900 text-stone-50 px-3.5 py-2 text-sm">
          Show me
        </button>
      )
    }
  } else {
    body = steps ? (
      <ol className="space-y-1 list-decimal list-inside">
        <li>
          Tap <span className="font-medium">⋮</span> in the browser menu
        </li>
        <li>
          Tap <span className="font-medium">Install app</span> or <span className="font-medium">Add to Home screen</span>
        </li>
      </ol>
    ) : (
      <>Install THE 14 for full screen play and quick access.</>
    )
    if (!steps) {
      action = (
        <button type="button" onClick={() => setSteps(true)} className="rounded-lg bg-stone-900 text-stone-50 px-3.5 py-2 text-sm">
          Show me
        </button>
      )
    }
  }

  return (
    <div className={cn('rounded-2xl border border-stone-200 bg-white p-4 flex gap-3 animate-fade-up', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-stone-900">Get the app</p>
          <button type="button" onClick={dismiss} aria-label="Not now" className="text-stone-300 hover:text-stone-500 -mt-1 -mr-1 px-1 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="text-sm text-stone-500 leading-snug">{body}</div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
