'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/db/supabase'
import { cn } from '@/lib/utils'

// ─── Live drawing over a broadcast channel. Nothing is saved. ─────────────

/** One line drawn without lifting the finger. Points are 0 to 1, x then y. */
export interface Stroke {
  id: string
  c: string
  w: number
  p: number[]
}

export interface SketchFeedItem {
  key: number
  name: string
  text?: string
  close?: boolean
  got?: boolean
}

type Message =
  | { t: 'seg'; id: string; c: string; w: number; p: number[] }
  | { t: 'clear' }
  | { t: 'hello' }
  | { t: 'full'; strokes: Stroke[] }
  | { t: 'guess'; name: string; text: string; close: boolean }
  | { t: 'got'; name: string }

// The last drawing stays here so the reveal can show it after the round ends.
const drawings = new Map<string, Stroke[]>()
let lastRound: string | null = null
export function lastDrawing() {
  return lastRound ? drawings.get(lastRound) ?? [] : []
}

const INKS = ['#1c1917', '#e11d48', '#2563eb', '#16a34a', '#F2A541', '#8b5cf6']
const WIDTHS = [0.008, 0.018, 0.04]
const ERASER = '#ffffff'

export function useSketch(roundId: string | undefined, isArtist: boolean) {
  const strokes = useRef<Stroke[]>([])
  const [version, setVersion] = useState(0)
  const [feed, setFeed] = useState<SketchFeedItem[]>([])
  const channel = useRef<RealtimeChannel | null>(null)
  const counter = useRef(0)

  const bump = useCallback(() => {
    if (roundId) {
      drawings.set(roundId, strokes.current)
      lastRound = roundId
    }
    setVersion((v) => v + 1)
  }, [roundId])

  const push = useCallback((item: Omit<SketchFeedItem, 'key'>) => {
    const key = ++counter.current
    setFeed((list) => [...list.slice(-20), { ...item, key }])
  }, [])

  useEffect(() => {
    if (!roundId) return
    strokes.current = drawings.get(roundId) ?? []
    bump()
    const ch = supabase.channel(`sketch:${roundId}`, { config: { broadcast: { self: false } } })
    ch.on('broadcast', { event: 'm' }, ({ payload }) => {
      const m = payload as Message
      if (m.t === 'seg') {
        const s = strokes.current.find((x) => x.id === m.id)
        if (s) s.p.push(...m.p)
        else strokes.current = [...strokes.current, { id: m.id, c: m.c, w: m.w, p: [...m.p] }]
        bump()
      } else if (m.t === 'clear') {
        strokes.current = []
        bump()
      } else if (m.t === 'hello' && isArtist) {
        void ch.send({ type: 'broadcast', event: 'm', payload: { t: 'full', strokes: strokes.current } satisfies Message })
      } else if (m.t === 'full' && !isArtist) {
        const have = strokes.current.reduce((n, s) => n + s.p.length, 0)
        const got = m.strokes.reduce((n, s) => n + s.p.length, 0)
        if (got > have) {
          strokes.current = m.strokes.map((s) => ({ ...s, p: [...s.p] }))
          bump()
        }
      } else if (m.t === 'guess') {
        push({ name: m.name, text: m.text, close: m.close })
      } else if (m.t === 'got') {
        push({ name: m.name, got: true })
      }
    })
    ch.subscribe((status) => {
      // Joined late or reloaded: ask the artist for what is drawn so far.
      if (status === 'SUBSCRIBED' && !isArtist) void ch.send({ type: 'broadcast', event: 'm', payload: { t: 'hello' } satisfies Message })
    })
    channel.current = ch
    return () => {
      channel.current = null
      supabase.removeChannel(ch)
    }
  }, [roundId, isArtist, bump, push])

  const send = useCallback((m: Message) => {
    void channel.current?.send({ type: 'broadcast', event: 'm', payload: m })
  }, [])

  const sendGuess = useCallback(
    (name: string, text: string, close: boolean) => {
      push({ name, text, close })
      send({ t: 'guess', name, text, close })
    },
    [push, send],
  )
  const sendGot = useCallback(
    (name: string) => {
      push({ name, got: true })
      send({ t: 'got', name })
    },
    [push, send],
  )

  return { strokes, version, bump, feed, send, sendGuess, sendGot }
}

// ─── Canvas ────────────────────────────────────────────────────────────────

function paint(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width: w, height: h } = canvas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of strokes) {
    if (s.p.length < 2) continue
    ctx.strokeStyle = s.c
    ctx.lineWidth = Math.max(1, s.w * w)
    ctx.beginPath()
    ctx.moveTo(s.p[0] * w, s.p[1] * h)
    if (s.p.length === 2) ctx.lineTo(s.p[0] * w + 0.1, s.p[1] * h)
    for (let i = 2; i < s.p.length; i += 2) ctx.lineTo(s.p[i] * w, s.p[i + 1] * h)
    ctx.stroke()
  }
}

/** A square white board. Pass the drawing handlers to let someone draw on it. */
export function SketchCanvas({
  strokes,
  version,
  className,
  onStart,
  onMove,
  onEnd,
}: {
  strokes: Stroke[]
  version: number
  className?: string
  onStart?: (x: number, y: number) => void
  onMove?: (x: number, y: number) => void
  onEnd?: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const latest = useRef(strokes)
  latest.current = strokes

  // Keep the canvas sharp at any size.
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const size = Math.round(canvas.clientWidth * dpr)
      if (canvas.width !== size) {
        canvas.width = size
        canvas.height = size
      }
      paint(canvas, latest.current)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const id = requestAnimationFrame(() => paint(canvas, latest.current))
    return () => cancelAnimationFrame(id)
  }, [version, strokes])

  const drawing = Boolean(onStart)
  const at = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect()
    const clamp = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000
    return [clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height)]
  }

  return (
    <canvas
      ref={ref}
      className={cn('w-full aspect-square rounded-2xl bg-white shadow-sm', drawing && 'touch-none cursor-crosshair', className)}
      onPointerDown={
        drawing
          ? (e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              onStart?.(...at(e))
            }
          : undefined
      }
      onPointerMove={drawing ? (e) => e.buttons && onMove?.(...at(e)) : undefined}
      onPointerUp={drawing ? () => onEnd?.() : undefined}
      onPointerCancel={drawing ? () => onEnd?.() : undefined}
    />
  )
}

// ─── The artist's phone ────────────────────────────────────────────────────

export function SketchPad({ roundId, word, disabled }: { roundId: string; word: string; disabled: boolean }) {
  const { strokes, version, bump, feed, send } = useSketch(roundId, true)
  const [ink, setInk] = useState(INKS[0])
  const [width, setWidth] = useState(WIDTHS[1])
  const current = useRef<Stroke | null>(null)
  const pending = useRef<number[]>([])

  // Send new points a few times a second rather than on every move.
  const flush = useCallback(() => {
    const s = current.current
    if (!s || !pending.current.length) return
    send({ t: 'seg', id: s.id, c: s.c, w: s.w, p: pending.current })
    pending.current = []
  }, [send])

  useEffect(() => {
    const t = setInterval(flush, 60)
    return () => clearInterval(t)
  }, [flush])

  const start = (x: number, y: number) => {
    if (disabled) return
    flush()
    const s: Stroke = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, c: ink, w: width, p: [x, y] }
    current.current = s
    pending.current = [x, y]
    strokes.current = [...strokes.current, s]
    bump()
  }
  const move = (x: number, y: number) => {
    const s = current.current
    if (!s || disabled) return
    const lx = s.p[s.p.length - 2]
    const ly = s.p[s.p.length - 1]
    if (Math.abs(lx - x) + Math.abs(ly - y) < 0.004) return
    s.p.push(x, y)
    pending.current.push(x, y)
    bump()
  }
  const end = () => {
    flush()
    current.current = null
  }
  const clear = () => {
    flush()
    current.current = null
    strokes.current = []
    bump()
    send({ t: 'clear' })
  }

  const got = feed.filter((f) => f.got)

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-stone-900 text-stone-50 px-4 py-3 flex items-baseline justify-between gap-3">
        <span className="text-xs tracking-widest uppercase text-stone-400">Draw</span>
        <span className="text-2xl font-medium">{word}</span>
      </div>
      <SketchCanvas strokes={strokes.current} version={version} onStart={start} onMove={move} onEnd={end} className="border border-stone-200" />
      <div className="flex items-center gap-2">
        {INKS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label="Colour"
            onClick={() => setInk(c)}
            className={cn('w-8 h-8 rounded-full border-2 transition-transform', ink === c ? 'border-stone-900 scale-110' : 'border-transparent')}
            style={{ backgroundColor: c }}
          />
        ))}
        <button
          type="button"
          onClick={() => setInk(ERASER)}
          className={cn('h-8 px-2 rounded-full border-2 text-xs text-stone-600 bg-white', ink === ERASER ? 'border-stone-900' : 'border-stone-200')}
        >
          Eraser
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1">
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              aria-label="Brush size"
              onClick={() => setWidth(w)}
              className={cn('w-9 h-8 rounded-lg flex items-center justify-center', width === w ? 'bg-white shadow-sm' : '')}
            >
              <span className="rounded-full bg-stone-800" style={{ width: 4 + w * 300, height: 4 + w * 300 }} />
            </button>
          ))}
        </div>
        <button type="button" onClick={clear} disabled={disabled} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600">
          Clear
        </button>
      </div>
      <p className="text-xs text-stone-400 text-center">
        {got.length ? `${got.map((g) => g.name).join(', ')} got it` : 'No letters or numbers. Just draw.'}
      </p>
    </div>
  )
}

// ─── Everyone else's phone ─────────────────────────────────────────────────

export function SketchGuess({
  roundId,
  hint,
  myName,
  solved,
  disabled,
}: {
  roundId: string
  hint?: string
  myName: string
  solved: boolean
  disabled: boolean
}) {
  const { strokes, version, feed, sendGuess, sendGot } = useSketch(roundId, false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [got, setGot] = useState(false)
  const done = solved || got

  async function guess(e: React.FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t || busy || done || disabled) return
    setBusy(true)
    setNote(null)
    try {
      const res = await fetch('/api/action/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: t }) })
      const data = await res.json()
      if (!res.ok) setNote(data.error ?? 'Could not send that.')
      else if (data.wrong) {
        setNote(data.close ? 'So close.' : 'Not it.')
        sendGuess(myName, t, Boolean(data.close))
        setText('')
      } else {
        setGot(true)
        sendGot(myName)
      }
    } catch {
      setNote('Connection problem. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <SketchCanvas strokes={strokes.current} version={version} className="border border-stone-200" />
      {hint && <p className="text-center font-mono tracking-[0.3em] text-stone-500">{hint}</p>}
      {done ? (
        <p className="rounded-xl bg-emerald-50 text-emerald-900 px-4 py-3 text-center text-sm animate-fade-up">You got it. Watch the others squirm.</p>
      ) : (
        <form onSubmit={guess} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={40}
            disabled={disabled}
            placeholder="Your guess"
            autoComplete="off"
            className="flex-1 min-w-0 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 outline-none focus:border-stone-400"
          />
          <button type="submit" disabled={busy || disabled || !text.trim()} className="rounded-xl bg-stone-900 text-stone-50 px-5 text-sm font-medium disabled:opacity-40">
            Guess
          </button>
        </form>
      )}
      {note && !done && <p key={note + feed.length} className={cn('text-sm text-center animate-fade-up', note === 'So close.' ? 'text-accent-deep' : 'text-stone-500')}>{note}</p>}
      <SketchFeed feed={feed} />
    </div>
  )
}

/** Guesses scrolling by: wrong ones in grey, right ones as "got it". */
export function SketchFeed({ feed, dark = false, size = 'phone' }: { feed: SketchFeedItem[]; dark?: boolean; size?: 'phone' | 'stage' }) {
  const items = feed.slice(size === 'stage' ? -8 : -4)
  if (!items.length) return null
  return (
    <ul className={cn('space-y-1', size === 'stage' ? 'text-lg' : 'text-sm')}>
      {items.map((f) => (
        <li key={f.key} className="animate-fade-up truncate">
          <span className={dark ? 'text-stone-300' : 'text-stone-700'}>{f.name}</span>{' '}
          {f.got ? (
            <span className="text-emerald-500">got it</span>
          ) : (
            <span className={cn(dark ? 'text-stone-500' : 'text-stone-400', f.close && 'text-accent')}>{f.text}{f.close ? ' (close)' : ''}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

/** The big screen: the drawing as it happens, and the guesses. */
export function SketchStage({ roundId, hint, artist, size = 'stage' }: { roundId: string; hint?: string; artist?: string; size?: 'phone' | 'stage' }) {
  const { strokes, version, feed } = useSketch(roundId, false)
  const stage = size === 'stage'
  return (
    <div className={cn('grid gap-6', stage ? 'md:grid-cols-[minmax(0,1fr)_16rem] items-start' : '')}>
      <div className="space-y-3">
        <SketchCanvas strokes={strokes.current} version={version} className={stage ? 'max-w-[60vh] mx-auto' : ''} />
        {hint && <p className={cn('text-center font-mono tracking-[0.35em] text-stone-300', stage ? 'text-3xl' : 'text-lg')}>{hint}</p>}
      </div>
      <div className="space-y-3">
        <p className="text-xs tracking-widest uppercase text-stone-500">{artist ? `${artist} is drawing` : 'Guesses'}</p>
        <SketchFeed feed={feed} dark size={size} />
        {!feed.length && <p className="text-sm text-stone-500">Guesses show up here.</p>}
      </div>
    </div>
  )
}

/** The finished drawing, for the reveal. */
export function SketchShot({ className }: { className?: string }) {
  const strokes = lastDrawing()
  if (!strokes.length) return null
  return <SketchCanvas strokes={strokes} version={strokes.length} className={className} />
}
