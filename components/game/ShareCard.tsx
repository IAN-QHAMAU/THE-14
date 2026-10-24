'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { renderShareCard, shareCardImage, type ShareCardInput } from '@/lib/shareCard'

/**
 * Builds the result card as soon as the podium is shown, so tapping Share
 * opens the share sheet straight away (iPhones require that).
 */
export function ShareCard(props: ShareCardInput & { dark?: boolean }) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const key = `${props.mode}:${props.battle?.map((t) => t.name + t.icon).join('|') ?? ''}:${props.me?.player_id ?? 'all'}:${props.scores.map((x) => x.total).join(',')}:${Object.keys(props.tags).length}`

  useEffect(() => {
    let alive = true
    let url: string | null = null
    renderShareCard(props).then((b) => {
      if (!alive || !b) return
      url = URL.createObjectURL(b)
      setBlob(b)
      setPreview(url)
    })
    return () => {
      alive = false
      if (url) URL.revokeObjectURL(url)
    }
    // Re-render only when the result itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  async function share(save = false) {
    if (!blob) return
    setNote('')
    if (save) {
      const a = document.createElement('a')
      a.href = preview!
      a.download = props.mode === 'group' ? 'the14-results.png' : props.mode === 'team' ? 'the14-teams.png' : 'the14-result.png'
      a.click()
      setNote('Saved.')
      return
    }
    const r = await shareCardImage(blob, props.mode === 'group' ? 'the14-results.png' : props.mode === 'team' ? 'the14-teams.png' : 'the14-result.png')
    if (r === 'saved') setNote('Saved to your downloads.')
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden bg-stone-800 aspect-[9/16] w-36 mx-auto">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={props.mode === 'group' ? 'Group results card' : props.mode === 'team' ? 'Team Battle card' : 'Your result card'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full animate-pulse" />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1 bg-transparent border-stone-700 text-stone-300 hover:bg-stone-800"
          disabled={!blob}
          onClick={() => void share(true)}
        >
          Save image
        </Button>
        <Button className="flex-1 bg-stone-50 text-stone-900 hover:bg-stone-200" disabled={!blob} onClick={() => void share()}>
          Share
        </Button>
      </div>
      {note && <p className="text-xs text-center text-stone-500">{note}</p>}
    </div>
  )
}

/** Team Battle: a switch between your own card and the team card. */
export function ResultCards({ battle, ...props }: ShareCardInput & { battle?: ShareCardInput['battle'] }) {
  const [mode, setMode] = useState<ShareCardInput['mode']>(battle ? 'team' : props.mode)
  if (!battle) return <ShareCard {...props} />
  const options: { id: ShareCardInput['mode']; label: string }[] = [
    { id: 'team', label: 'Team card' },
    props.mode === 'player' ? { id: 'player', label: 'My card' } : { id: 'group', label: 'Everyone' },
  ]
  return (
    <div className="space-y-3">
      <div className="mx-auto flex w-fit rounded-xl bg-stone-800 p-1">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setMode(o.id)}
            className={'rounded-lg px-4 py-1.5 text-xs transition-colors ' + (mode === o.id ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-200')}
          >
            {o.label}
          </button>
        ))}
      </div>
      <ShareCard key={mode} {...props} mode={mode} battle={battle} />
    </div>
  )
}
