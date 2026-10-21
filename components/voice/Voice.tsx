'use client'
import { useEffect, useState } from 'react'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { useVoice } from '@/lib/voice/VoiceProvider'
import { MAX_VOICE } from '@/lib/voice/mesh'
import { cn } from '@/lib/utils'

function MicIcon({ off = false, className }: { off?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('w-5 h-5', className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  )
}

function SpeakerIcon({ loud = false, className }: { loud?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('w-5 h-5', className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      {loud && <path d="M18.5 5.5a9 9 0 0 1 0 13" />}
    </svg>
  )
}

/** Floating voice button for players, bottom right. */
export function VoiceFab() {
  const voice = useVoice()
  const [open, setOpen] = useState(false)
  if (!voice?.me) return null
  const live = voice.state.status === 'live'
  const off = voice.state.muted || voice.state.quieted
  const talking = live && voice.state.speaking.has(voice.me.id)

  return (
    <>
      <div className="fixed right-3 z-40 flex items-center gap-1.5" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        {live && (
          <button
            type="button"
            onClick={voice.toggleMute}
            aria-label={off ? 'Unmute' : 'Mute'}
            disabled={voice.state.quieted}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center shadow-sm border transition-colors',
              off ? 'bg-stone-200 border-stone-300 text-stone-500' : 'bg-stone-900 border-stone-900 text-stone-50',
              talking && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent',
            )}
          >
            <MicIcon off={off} />
          </button>
        )}
        {live && (
          <button
            type="button"
            onClick={voice.toggleLoudspeaker}
            aria-label={voice.state.loudspeaker ? 'Loudspeaker off' : 'Loudspeaker on'}
            aria-pressed={voice.state.loudspeaker}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center shadow-sm border transition-colors',
              voice.state.loudspeaker ? 'bg-stone-900 border-stone-900 text-stone-50' : 'bg-white/90 backdrop-blur border-stone-200 text-stone-700',
            )}
          >
            <SpeakerIcon loud={voice.state.loudspeaker} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 px-3.5 rounded-full bg-white/90 backdrop-blur border border-stone-200 text-stone-700 text-sm shadow-sm flex items-center gap-1.5"
          aria-label="Voice chat"
        >
          {live ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {voice.state.peers.length + 1}
            </>
          ) : (
            <>
              <MicIcon className="w-4 h-4" />
              Voice
            </>
          )}
        </button>
      </div>
      {voice.hostMutedMe && (
        <p className="fixed right-3 z-40 text-xs bg-stone-900 text-stone-100 rounded-full px-3 py-1.5" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}>
          The host muted you
        </p>
      )}
      {open && <VoiceSheet onClose={() => setOpen(false)} />}
    </>
  )
}

/** Voice button for the GM top bar. */
export function VoiceHeaderButton({ onSaveSettings }: { onSaveSettings: (s: { voiceQuiet?: boolean; callLink?: string }) => void }) {
  const voice = useVoice()
  const [open, setOpen] = useState(false)
  if (!voice?.me) return null
  const live = voice.state.status === 'live'
  const off = voice.state.muted
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Voice chat"
        className={cn(
          'text-xs rounded-full border px-2.5 py-1 whitespace-nowrap flex items-center gap-1',
          live ? 'border-emerald-700 text-emerald-300' : 'border-stone-700 text-stone-400 hover:text-stone-200',
        )}
      >
        <MicIcon off={live && off} className="w-3.5 h-3.5" />
        {live ? voice.state.peers.length + 1 : 'Voice'}
      </button>
      {open && <VoiceSheet onClose={() => setOpen(false)} dark onSaveSettings={onSaveSettings} />}
    </>
  )
}

function VoiceSheet({
  onClose,
  dark = false,
  onSaveSettings,
}: {
  onClose: () => void
  dark?: boolean
  onSaveSettings?: (s: { voiceQuiet?: boolean; callLink?: string }) => void
}) {
  const voice = useVoice()!
  const { state, me, isHost } = voice
  const live = state.status === 'live'
  const [link, setLink] = useState(voice.callLink ?? '')

  useEffect(() => setLink(voice.callLink ?? ''), [voice.callLink])

  const panel = dark ? 'bg-stone-900 text-stone-100 border-stone-700' : 'bg-white text-stone-900 border-stone-200'
  const muted = dark ? 'text-stone-400' : 'text-stone-500'
  const row = dark ? 'bg-stone-800' : 'bg-stone-50'
  const failed = state.peers.filter((p) => p.link === 'failed')
  const everyone = me ? [{ ...me, muted: state.muted || state.quieted, link: 'connected' as const }, ...state.peers] : state.peers

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6" onClick={onClose}>
      <div
        className={cn('w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl border p-5 space-y-4 animate-fade-up max-h-[85dvh] overflow-y-auto', panel)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Voice chat"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Voice chat</h2>
          <button type="button" onClick={onClose} aria-label="Close" className={cn('text-2xl leading-none px-1', muted)}>
            ×
          </button>
        </div>

        {!live && (
          <div className="space-y-3">
            <p className={cn('text-sm', muted)}>
              Talk with everyone in this game, free. Up to {MAX_VOICE} people. Earphones work best.
            </p>
            {state.error && <p className="text-sm text-rose-500">{state.error}</p>}
            <button
              type="button"
              onClick={voice.join}
              disabled={state.status === 'connecting'}
              className={cn(
                'w-full rounded-xl py-3 text-sm font-medium disabled:opacity-60',
                dark ? 'bg-stone-50 text-stone-900' : 'bg-stone-900 text-stone-50',
              )}
            >
              {state.status === 'connecting' ? 'Connecting…' : 'Join voice'}
            </button>
          </div>
        )}

        {live && (
          <div className="space-y-3">
            {state.quieted && <p className={cn('text-sm', muted)}>Everyone is muted while the question is live.</p>}
            <ul className="space-y-1.5">
              {everyone.map((p) => {
                const talking = state.speaking.has(p.id)
                return (
                  <li key={p.id} className={cn('flex items-center gap-3 rounded-xl px-3 py-2', row)}>
                    <AvatarDisplay
                      avatarId={p.avatar}
                      size="sm"
                      className={cn('transition-shadow', talking && 'ring-2 ring-emerald-400 ring-offset-2', talking && (dark ? 'ring-offset-stone-800' : 'ring-offset-stone-50'))}
                    />
                    <span className="flex-1 min-w-0 truncate text-sm">
                      {p.id === me?.id ? `${p.name} (you)` : p.name}
                    </span>
                    <span className={cn('text-xs', p.link === 'failed' ? 'text-rose-500' : muted)}>
                      {p.link === 'failed' ? "can't connect" : p.link === 'connecting' ? 'connecting…' : talking ? 'talking' : p.muted ? 'muted' : ''}
                    </span>
                    {isHost && p.id !== me?.id && !p.muted && (
                      <button type="button" onClick={() => voice.hostMute(p.id)} className={cn('text-xs underline underline-offset-2', muted)}>
                        Mute
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            {failed.length > 0 && (
              <p className={cn('text-xs', muted)}>
                {failed.map((p) => p.name).join(', ')} can&apos;t connect. Some networks block direct calls; the call link below always works.
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={voice.toggleMute}
                disabled={state.quieted}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50',
                  state.muted ? (dark ? 'bg-stone-700 text-stone-100' : 'bg-stone-200 text-stone-700') : dark ? 'bg-stone-50 text-stone-900' : 'bg-stone-900 text-stone-50',
                )}
              >
                <MicIcon off={state.muted} className="w-4 h-4" />
                {state.muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                type="button"
                onClick={voice.toggleLoudspeaker}
                aria-pressed={state.loudspeaker}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2',
                  state.loudspeaker ? (dark ? 'bg-stone-50 text-stone-900' : 'bg-stone-900 text-stone-50') : cn('border', dark ? 'border-stone-700' : 'border-stone-200'),
                )}
              >
                <SpeakerIcon loud={state.loudspeaker} className="w-4 h-4" />
                Speaker
              </button>
              <button type="button" onClick={voice.leave} className={cn('flex-1 rounded-xl py-2.5 text-sm border', dark ? 'border-stone-700' : 'border-stone-200')}>
                Leave
              </button>
            </div>
            <p className={cn('text-xs', muted)}>
              {state.loudspeaker ? 'Loudspeaker is on: voices are boosted so you can hear from across the room.' : 'Hard to hear? Turn on Speaker to make everyone louder.'}
            </p>
            {isHost && everyone.length > 1 && (
              <button type="button" onClick={() => voice.hostMute('*')} className={cn('w-full text-sm rounded-xl py-2.5 border', dark ? 'border-stone-700' : 'border-stone-200')}>
                Mute everyone
              </button>
            )}
          </div>
        )}

        {voice.callLink && (
          <a
            href={voice.callLink}
            target="_blank"
            rel="noreferrer"
            className={cn('block w-full text-center rounded-xl py-2.5 text-sm border', dark ? 'border-stone-700' : 'border-stone-200')}
          >
            Join the group call instead
          </a>
        )}

        {isHost && onSaveSettings && (
          <div className={cn('space-y-3 border-t pt-4', dark ? 'border-stone-800' : 'border-stone-100')}>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                Quiet during questions
                <span className={cn('block text-xs', muted)}>Mutes everyone while answering, so nobody shouts the answer.</span>
              </span>
              <input
                type="checkbox"
                checked={voice.quietDuringQuestions}
                onChange={(e) => onSaveSettings({ voiceQuiet: e.target.checked })}
                className="w-5 h-5 accent-emerald-600"
              />
            </label>
            <div className="space-y-1.5">
              <p className="text-sm">
                Backup call link
                <span className={cn('block text-xs', muted)}>WhatsApp, Meet or Discord. Shows a Join call button for everyone.</span>
              </p>
              <div className="flex gap-2">
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://"
                  inputMode="url"
                  className={cn('flex-1 min-w-0 rounded-xl px-3 py-2 text-sm border bg-transparent', dark ? 'border-stone-700' : 'border-stone-200')}
                />
                <button type="button" onClick={() => onSaveSettings({ callLink: link.trim() })} className={cn('rounded-xl px-3 py-2 text-sm', dark ? 'bg-stone-50 text-stone-900' : 'bg-stone-900 text-stone-50')}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Small speaking ring and mic badge for avatars in player lists. */
export function useSpeaking(playerId: string) {
  const voice = useVoice()
  if (!voice || voice.state.status !== 'live') return { inVoice: false, talking: false, muted: false }
  if (voice.me?.id === playerId) return { inVoice: true, talking: voice.state.speaking.has(playerId), muted: voice.state.muted || voice.state.quieted }
  const peer = voice.state.peers.find((p) => p.id === playerId)
  return { inVoice: Boolean(peer), talking: voice.state.speaking.has(playerId), muted: Boolean(peer?.muted) }
}
