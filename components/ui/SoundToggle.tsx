'use client'
import { useMuted, sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function SoundToggle({ dark = false, className }: { dark?: boolean; className?: string }) {
  const [muted, setMuted] = useMuted()
  return (
    <button
      type="button"
      onClick={() => {
        setMuted(!muted)
        if (muted) sound.unlock()
      }}
      aria-label={muted ? 'Turn sound on' : 'Mute sound'}
      className={cn(
        'w-8 h-8 inline-flex items-center justify-center rounded-full text-sm transition-colors',
        dark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-400 hover:bg-stone-100',
        className,
      )}
    >
      {muted ? '🔇' : '🔈'}
    </button>
  )
}
