'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { renderShareCard, shareCardImage, type ShareCardInput } from '@/lib/shareCard'

/**
 * Builds the result card as soon as the podium is shown, so tapping Share
 * opens the share sheet straight away (iPhones require that).
 */
export function ShareCard(props: ShareCardInput) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const key = `${props.me.player_id}:${props.me.total}:${props.rank}:${props.awards.length}`

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
      a.download = 'the14-result.png'
      a.click()
      setNote('Saved.')
      return
    }
    const r = await shareCardImage(blob)
    if (r === 'saved') setNote('Saved to your downloads.')
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden bg-stone-800 aspect-[4/5] w-40 mx-auto">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your result card" className="w-full h-full object-cover" />
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
