'use client'

// Free voice chat: every phone connects straight to every other phone
// (a "mesh"). Fine for small groups, so voice is capped at MAX_VOICE people.
// The transport only introduces phones to each other (signalling); the audio
// itself goes phone to phone and never touches our server.

export const MAX_VOICE = 8

export interface PeerInfo {
  id: string
  name: string
  avatar: string
  muted: boolean
}

export type VoiceSignal =
  | { kind: 'offer' | 'answer'; from: string; to: string; sdp: string }
  | { kind: 'ice'; from: string; to: string; candidate: RTCIceCandidateInit }
  | { kind: 'host_mute'; from: string; to: string }

/** How phones find each other and swap connection details. */
export interface VoiceTransport {
  /** Resolves once connected, with whoever is already in voice. */
  connect(): Promise<PeerInfo[]>
  /** Announce yourself (and your mute state) to everyone in voice. */
  announce(me: PeerInfo): void
  send(signal: VoiceSignal): void
  onSignal(cb: (signal: VoiceSignal) => void): void
  onPeers(cb: (peers: PeerInfo[]) => void): void
  close(): void
}

export type VoiceStatus = 'idle' | 'connecting' | 'live' | 'full' | 'denied' | 'error'

export interface VoicePeerState extends PeerInfo {
  /** 'connected' once audio flows both ways. */
  link: 'connecting' | 'connected' | 'failed'
}

export interface VoiceState {
  status: VoiceStatus
  peers: VoicePeerState[]
  /** Ids of people currently talking, including yourself. */
  speaking: Set<string>
  /** Your own mute button. */
  muted: boolean
  /** Muted by the game, for example while a question is live. */
  quieted: boolean
  error?: string
}

const DEFAULT_ICE: RTCIceServer[] = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]

/** Optional relay (TURN) server for networks that block direct connections. */
export function iceServersFromEnv(): RTCIceServer[] {
  const url = process.env.NEXT_PUBLIC_TURN_URL
  if (!url) return DEFAULT_ICE
  return [
    ...DEFAULT_ICE,
    { urls: url.split(','), username: process.env.NEXT_PUBLIC_TURN_USERNAME, credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL },
  ]
}

interface Link {
  pc: RTCPeerConnection
  audio: HTMLAudioElement
  pendingIce: RTCIceCandidateInit[]
  analyser?: AnalyserNode
}

export class VoiceMesh {
  private me: PeerInfo
  private transport: VoiceTransport
  private iceServers: RTCIceServer[]
  private stream: MediaStream | null = null
  private links = new Map<string, Link>()
  private peers = new Map<string, PeerInfo>()
  private linkState = new Map<string, VoicePeerState['link']>()
  private ctx: AudioContext | null = null
  private localAnalyser?: AnalyserNode
  private speakTimer: ReturnType<typeof setInterval> | null = null
  private listeners = new Set<(s: VoiceState) => void>()
  private state: VoiceState = { status: 'idle', peers: [], speaking: new Set(), muted: false, quieted: false }
  /** Called when the host mutes you. */
  onHostMute?: () => void

  constructor(me: Omit<PeerInfo, 'muted'>, transport: VoiceTransport, iceServers = iceServersFromEnv()) {
    this.me = { ...me, muted: false }
    this.transport = transport
    this.iceServers = iceServers
  }

  subscribe(cb: (s: VoiceState) => void) {
    this.listeners.add(cb)
    cb(this.state)
    return () => {
      this.listeners.delete(cb)
    }
  }

  private emit(patch: Partial<VoiceState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((l) => l(this.state))
  }

  private emitPeers() {
    const peers = [...this.peers.values()]
      .filter((p) => p.id !== this.me.id)
      .map((p) => ({ ...p, link: this.linkState.get(p.id) ?? 'connecting' }))
    this.emit({ peers })
  }

  /** Join voice. Must be called from a tap so phones allow the mic and audio. */
  async join() {
    if (this.state.status === 'connecting' || this.state.status === 'live') return
    this.emit({ status: 'connecting', error: undefined })
    try {
      this.ctx = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      void this.ctx.resume()

      this.transport.onSignal((s) => void this.handleSignal(s))
      this.transport.onPeers((list) => this.syncPeers(list))
      const already = await this.transport.connect()
      // Room for MAX_VOICE people in total, counting yourself.
      if (already.filter((p) => p.id !== this.me.id).length >= MAX_VOICE) {
        this.transport.close()
        this.emit({ status: 'full', error: `Voice is full (${MAX_VOICE} people). Use the call link instead.` })
        return
      }

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        })
      } catch {
        this.transport.close()
        this.emit({ status: 'denied', error: 'Microphone blocked. Allow the mic in your browser settings, then try again.' })
        return
      }

      this.localAnalyser = this.makeAnalyser(this.stream)
      this.applyTrackState()
      this.emit({ status: 'live' })
      this.transport.announce(this.me)
      this.syncPeers(already)
      this.speakTimer = setInterval(() => this.detectSpeaking(), 150)
    } catch (err) {
      this.emit({ status: 'error', error: (err as Error)?.message || 'Voice could not start.' })
    }
  }

  leave() {
    if (this.speakTimer) clearInterval(this.speakTimer)
    this.speakTimer = null
    for (const id of [...this.links.keys()]) this.dropLink(id)
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.transport.close()
    void this.ctx?.close().catch(() => {})
    this.ctx = null
    this.peers.clear()
    this.linkState.clear()
    this.emit({ status: 'idle', peers: [], speaking: new Set(), error: undefined })
  }

  setMuted(muted: boolean) {
    this.emit({ muted })
    this.applyTrackState()
  }

  /** Game controlled mute (Quiet during questions). */
  setQuieted(quieted: boolean) {
    if (quieted === this.state.quieted) return
    this.emit({ quieted })
    this.applyTrackState()
  }

  /** Host only: ask one person (or '*' for everyone) to mute. */
  hostMute(target: string) {
    this.transport.send({ kind: 'host_mute', from: this.me.id, to: target })
  }

  private applyTrackState() {
    const off = this.state.muted || this.state.quieted
    this.stream?.getAudioTracks().forEach((t) => (t.enabled = !off))
    const muted = off
    if (this.me.muted !== muted) {
      this.me = { ...this.me, muted }
      if (this.state.status === 'live') this.transport.announce(this.me)
    }
  }

  // ── Peers ────────────────────────────────────────────────────────────────

  private syncPeers(list: PeerInfo[]) {
    if (this.state.status !== 'live') {
      // Remember who is there; links start once we are live.
      for (const p of list) this.peers.set(p.id, p)
      return
    }
    const ids = new Set(list.map((p) => p.id))
    for (const p of list) this.peers.set(p.id, p)
    for (const id of [...this.peers.keys()]) {
      if (!ids.has(id)) {
        this.peers.delete(id)
        this.dropLink(id)
      }
    }
    for (const p of list) {
      if (p.id === this.me.id || this.links.has(p.id)) continue
      // Only one side starts each connection, so two phones never collide.
      if (this.me.id < p.id) void this.startLink(p.id, true)
    }
    this.emitPeers()
  }

  private createLink(peerId: string): Link {
    const pc = new RTCPeerConnection({ iceServers: this.iceServers })
    const audio = document.createElement('audio')
    audio.autoplay = true
    audio.setAttribute('playsinline', '')
    audio.style.display = 'none'
    document.body.appendChild(audio)
    const link: Link = { pc, audio, pendingIce: [] }

    this.stream?.getTracks().forEach((t) => pc.addTrack(t, this.stream!))
    pc.onicecandidate = (e) => {
      if (e.candidate) this.transport.send({ kind: 'ice', from: this.me.id, to: peerId, candidate: e.candidate.toJSON() })
    }
    pc.ontrack = (e) => {
      const [remote] = e.streams
      if (!remote) return
      audio.srcObject = remote
      void audio.play().catch(() => {})
      link.analyser = this.makeAnalyser(remote)
    }
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState
      if (st === 'connected') this.linkState.set(peerId, 'connected')
      else if (st === 'failed') this.linkState.set(peerId, 'failed')
      else if (st === 'connecting' || st === 'new') this.linkState.set(peerId, 'connecting')
      this.emitPeers()
    }
    this.links.set(peerId, link)
    this.linkState.set(peerId, 'connecting')
    return link
  }

  private async startLink(peerId: string, offer: boolean) {
    const link = this.links.get(peerId) ?? this.createLink(peerId)
    if (!offer) return link
    const desc = await link.pc.createOffer()
    await link.pc.setLocalDescription(desc)
    this.transport.send({ kind: 'offer', from: this.me.id, to: peerId, sdp: desc.sdp ?? '' })
    return link
  }

  private dropLink(peerId: string) {
    const link = this.links.get(peerId)
    if (!link) return
    link.pc.close()
    link.audio.srcObject = null
    link.audio.remove()
    this.links.delete(peerId)
    this.linkState.delete(peerId)
  }

  private async handleSignal(s: VoiceSignal) {
    if (s.to !== this.me.id && s.to !== '*') return
    if (s.kind === 'host_mute') {
      this.setMuted(true)
      this.onHostMute?.()
      return
    }
    if (this.state.status !== 'live' || s.from === this.me.id) return
    try {
      if (s.kind === 'offer') {
        const link = (await this.startLink(s.from, false))!
        await link.pc.setRemoteDescription({ type: 'offer', sdp: s.sdp })
        await this.flushIce(link)
        const answer = await link.pc.createAnswer()
        await link.pc.setLocalDescription(answer)
        this.transport.send({ kind: 'answer', from: this.me.id, to: s.from, sdp: answer.sdp ?? '' })
      } else if (s.kind === 'answer') {
        const link = this.links.get(s.from)
        if (!link || link.pc.signalingState !== 'have-local-offer') return
        await link.pc.setRemoteDescription({ type: 'answer', sdp: s.sdp })
        await this.flushIce(link)
      } else if (s.kind === 'ice') {
        const link = this.links.get(s.from)
        if (!link) return
        if (link.pc.remoteDescription) await link.pc.addIceCandidate(s.candidate).catch(() => {})
        else link.pendingIce.push(s.candidate)
      }
    } catch {
      this.linkState.set(s.from, 'failed')
      this.emitPeers()
    }
  }

  private async flushIce(link: Link) {
    for (const c of link.pendingIce.splice(0)) await link.pc.addIceCandidate(c).catch(() => {})
  }

  // ── Speaking detection ───────────────────────────────────────────────────

  private makeAnalyser(stream: MediaStream) {
    if (!this.ctx) return undefined
    try {
      const src = this.ctx.createMediaStreamSource(stream)
      const analyser = this.ctx.createAnalyser()
      analyser.fftSize = 512
      src.connect(analyser)
      return analyser
    } catch {
      return undefined
    }
  }

  private level(analyser?: AnalyserNode) {
    if (!analyser) return 0
    const buf = new Uint8Array(analyser.fftSize)
    analyser.getByteTimeDomainData(buf)
    let sum = 0
    for (const v of buf) sum += ((v - 128) / 128) ** 2
    return Math.sqrt(sum / buf.length)
  }

  private detectSpeaking() {
    const speaking = new Set<string>()
    const threshold = 0.04
    if (!this.me.muted && this.level(this.localAnalyser) > threshold) speaking.add(this.me.id)
    for (const [id, link] of this.links) {
      if (this.level(link.analyser) > threshold) speaking.add(id)
    }
    const prev = this.state.speaking
    const changed = speaking.size !== prev.size || [...speaking].some((id) => !prev.has(id))
    if (changed) this.emit({ speaking })
  }
}
