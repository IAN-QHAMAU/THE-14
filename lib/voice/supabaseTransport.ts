'use client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/db/supabase'
import type { PeerInfo, VoiceSignal, VoiceTransport } from './mesh'

/**
 * Uses the game's existing Supabase Realtime connection to introduce phones
 * to each other: presence says who is in voice, broadcast carries the
 * connection details. No audio passes through here.
 */
export function supabaseVoiceTransport(gameId: string, myId: string): VoiceTransport {
  let channel: RealtimeChannel | null = null
  let signalCb: ((s: VoiceSignal) => void) | null = null
  let peersCb: ((p: PeerInfo[]) => void) | null = null

  const readPeers = (): PeerInfo[] => {
    if (!channel) return []
    const state = channel.presenceState<PeerInfo>()
    return Object.values(state)
      .map((metas) => metas[0])
      .filter(Boolean)
      .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, muted: m.muted }))
  }

  return {
    connect() {
      return new Promise<PeerInfo[]>((resolve) => {
        let done = false
        const finish = () => {
          if (done) return
          done = true
          resolve(readPeers())
        }
        channel = supabase.channel(`voice:${gameId}`, {
          config: { broadcast: { self: false }, presence: { key: myId } },
        })
        channel
          .on('broadcast', { event: 'signal' }, ({ payload }) => signalCb?.(payload as VoiceSignal))
          .on('presence', { event: 'sync' }, () => {
            peersCb?.(readPeers())
            finish()
          })
          .subscribe((status) => {
            // If nobody is in voice yet there may be no sync straight away.
            if (status === 'SUBSCRIBED') setTimeout(finish, 1500)
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') finish()
          })
      })
    },
    announce(me) {
      void channel?.track(me)
    },
    send(signal) {
      void channel?.send({ type: 'broadcast', event: 'signal', payload: signal })
    },
    onSignal(cb) {
      signalCb = cb
    },
    onPeers(cb) {
      peersCb = cb
    },
    close() {
      if (!channel) return
      void channel.untrack()
      void supabase.removeChannel(channel)
      channel = null
    },
  }
}
