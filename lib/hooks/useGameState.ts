'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/db/supabase'
import { syncClock } from '@/lib/clock'
import { subscribeToActions, subscribeToEvents, subscribeToGame, subscribeToPlayers, subscribeToRounds } from '@/lib/realtime/subscriptions'
import type { GameStateResponse } from '@/types'

/**
 * Loads /api/game/state and refetches whenever anything in the game changes.
 * Bursts of realtime events are coalesced into a single fetch.
 */
export function useGameState(opts: { onUnauthorized: () => void; watchActions?: boolean }) {
  const [state, setState] = useState<GameStateResponse | null>(null)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const queued = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { onUnauthorized, watchActions } = opts

  const fetchState = useCallback(async () => {
    if (inFlight.current) {
      queued.current = true
      return
    }
    inFlight.current = true
    try {
      const started = Date.now()
      const res = await fetch('/api/game/state', { cache: 'no-store' })
      if (res.status === 401) {
        onUnauthorized()
        return
      }
      if (!res.ok) {
        setError('Could not load game.')
        return
      }
      const data = (await res.json()) as GameStateResponse
      syncClock(data.serverNow, started)
      setError('')
      setState(data)
    } catch {
      setError('Connection lost. Retrying.')
    } finally {
      inFlight.current = false
      if (queued.current) {
        queued.current = false
        void fetchState()
      }
    }
  }, [onUnauthorized])

  const refresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void fetchState(), 120)
  }, [fetchState])

  useEffect(() => {
    void fetchState()
  }, [fetchState])

  const gameId = state?.game.id
  const roundId = state?.currentRound?.id

  useEffect(() => {
    if (!gameId) return
    const subs = [
      subscribeToGame(gameId, refresh),
      subscribeToPlayers(gameId, refresh),
      subscribeToRounds(gameId, refresh),
      subscribeToEvents(gameId, refresh),
    ]
    return () => {
      subs.forEach((s) => supabase.removeChannel(s))
    }
  }, [gameId, refresh])

  useEffect(() => {
    if (!watchActions || !roundId) return
    const sub = subscribeToActions(roundId, refresh)
    return () => {
      supabase.removeChannel(sub)
    }
  }, [watchActions, roundId, refresh])

  // Safety net in case a realtime message is missed, and catch up on return.
  useEffect(() => {
    const id = setInterval(() => void fetchState(), 15000)
    const onVisible = () => document.visibilityState === 'visible' && void fetchState()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchState])

  return { state, error, refresh: fetchState }
}
