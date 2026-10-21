'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { VoiceMesh, type VoiceState } from './mesh'
import { supabaseVoiceTransport } from './supabaseTransport'

interface VoiceContextValue {
  state: VoiceState
  me: { id: string; name: string; avatar: string } | null
  isHost: boolean
  callLink?: string
  quietDuringQuestions: boolean
  hostMutedMe: boolean
  join: () => void
  leave: () => void
  toggleMute: () => void
  toggleLoudspeaker: () => void
  hostMute: (playerId: string | '*') => void
}

const IDLE: VoiceState = { status: 'idle', peers: [], speaking: new Set(), muted: false, quieted: false, loudspeaker: false }

const LOUD_KEY = 'the14:voice-loudspeaker'

function savedLoudspeaker() {
  try {
    return window.localStorage.getItem(LOUD_KEY) === '1'
  } catch {
    return false
  }
}

const VoiceContext = createContext<VoiceContextValue | null>(null)

export function useVoice() {
  return useContext(VoiceContext)
}

interface Props {
  gameId?: string
  me: { id: string; name: string; avatar: string } | null
  isHost?: boolean
  /** True while a question is live and the host has Quiet during questions on. */
  quiet: boolean
  quietDuringQuestions: boolean
  callLink?: string
  children: React.ReactNode
}

export function VoiceProvider({ gameId, me, isHost = false, quiet, quietDuringQuestions, callLink, children }: Props) {
  const [state, setState] = useState<VoiceState>(IDLE)
  const [hostMutedMe, setHostMutedMe] = useState(false)
  const mesh = useRef<VoiceMesh | null>(null)
  const meKey = me ? `${gameId}:${me.id}` : null

  // Leave voice when the game or player changes, or the page closes.
  useEffect(() => {
    return () => {
      mesh.current?.leave()
      mesh.current = null
      setState(IDLE)
    }
  }, [meKey])

  useEffect(() => {
    mesh.current?.setQuieted(quiet)
  }, [quiet])

  const join = useCallback(() => {
    if (!gameId || !me) return
    if (!mesh.current) {
      const m = new VoiceMesh(me, supabaseVoiceTransport(gameId, me.id))
      m.onHostMute = () => {
        setHostMutedMe(true)
        setTimeout(() => setHostMutedMe(false), 4000)
      }
      m.subscribe(setState)
      m.setLoudspeaker(savedLoudspeaker())
      mesh.current = m
    }
    mesh.current.setQuieted(quiet)
    void mesh.current.join()
  }, [gameId, me, quiet])

  const leave = useCallback(() => {
    mesh.current?.leave()
    mesh.current = null
    setState(IDLE)
  }, [])

  const toggleMute = useCallback(() => {
    mesh.current?.setMuted(!mesh.current ? false : !state.muted)
  }, [state.muted])

  const toggleLoudspeaker = useCallback(() => {
    const on = !state.loudspeaker
    try {
      window.localStorage.setItem(LOUD_KEY, on ? '1' : '0')
    } catch {}
    mesh.current?.setLoudspeaker(on)
  }, [state.loudspeaker])

  const hostMute = useCallback((playerId: string | '*') => {
    mesh.current?.hostMute(playerId)
  }, [])

  const value = useMemo<VoiceContextValue>(
    () => ({ state, me, isHost, callLink, quietDuringQuestions, hostMutedMe, join, leave, toggleMute, toggleLoudspeaker, hostMute }),
    [state, me, isHost, callLink, quietDuringQuestions, hostMutedMe, join, leave, toggleMute, toggleLoudspeaker, hostMute],
  )

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}

/** Players stay unmuted only while answering is not live. */
export function isQuestionLive(game: { status: string } | undefined, round: { status: string; ends_at: string | null } | null | undefined, now: number) {
  if (!game || game.status !== 'active' || !round) return false
  if (!['active', 'voting'].includes(round.status)) return false
  return !round.ends_at || now < Date.parse(round.ends_at)
}
