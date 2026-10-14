'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  AVATAR_BACKGROUNDS,
  AVATAR_STYLES,
  LEGACY_AVATARS,
  makeAvatarId,
  parseAvatar,
  randomSeed,
  type AvatarStyle,
} from '@/lib/avatar'

// Avatar artwork is large, so each style loads on first use.
type Renderer = (seed: string, bg: string) => string
const LOADERS: Record<AvatarStyle, () => Promise<unknown>> = {
  adventurer: () => import('@dicebear/adventurer'),
  lorelei: () => import('@dicebear/lorelei'),
  bigSmile: () => import('@dicebear/big-smile'),
  micah: () => import('@dicebear/micah'),
}
const renderers = new Map<AvatarStyle, Promise<Renderer>>()
const cache = new Map<string, string>()

function loadRenderer(style: AvatarStyle): Promise<Renderer> {
  let p = renderers.get(style)
  if (!p) {
    p = Promise.all([import('@dicebear/core'), LOADERS[style]()]).then(([core, mod]) => {
      const styleDef = mod as Parameters<typeof core.createAvatar>[0]
      return (seed: string, bg: string) =>
        core.createAvatar(styleDef, { seed, backgroundColor: [bg], radius: 50 }).toDataUri()
    })
    renderers.set(style, p)
  }
  return p
}

function useAvatarUri(style: AvatarStyle | undefined, seed: string | undefined, bg: string | undefined) {
  const key = style && seed && bg ? `${style}:${seed}:${bg}` : null
  const [uri, setUri] = useState<string | null>(key ? cache.get(key) ?? null : null)

  useEffect(() => {
    if (!key || !style || !seed || !bg) {
      setUri(null)
      return
    }
    const hit = cache.get(key)
    if (hit) {
      setUri(hit)
      return
    }
    let alive = true
    loadRenderer(style)
      .then((render) => {
        const out = render(seed, bg)
        cache.set(key, out)
        if (alive) setUri(out)
      })
      .catch(() => {
        // Keep the plain circle if the artwork fails to load.
      })
    return () => {
      alive = false
    }
  }, [key, style, seed, bg])

  return uri
}

const SIZES = {
  xs: 'w-6 h-6 text-sm',
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-4xl',
  xl: 'w-24 h-24 text-5xl',
}

export type AvatarMood = 'happy' | 'sad' | null

export function AvatarDisplay({
  avatarId,
  size = 'md',
  mood = null,
  className,
}: {
  avatarId: string
  size?: keyof typeof SIZES
  mood?: AvatarMood
  className?: string
}) {
  const parsed = parseAvatar(avatarId)
  const uri = useAvatarUri(parsed?.style, parsed?.seed, parsed?.bg)
  const moodClass = mood === 'happy' ? 'animate-avatar-hop' : mood === 'sad' ? 'animate-avatar-droop grayscale-[40%]' : ''

  if (parsed && !uri) {
    return <span className={cn('inline-block rounded-full flex-shrink-0', SIZES[size], className)} style={{ backgroundColor: `#${parsed.bg}` }} />
  }

  if (!uri) {
    return (
      <span className={cn('inline-flex items-center justify-center rounded-full bg-stone-100 flex-shrink-0', SIZES[size], moodClass, className)}>
        {LEGACY_AVATARS[avatarId] ?? '👤'}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={uri} alt="" draggable={false} className={cn('rounded-full flex-shrink-0 select-none', SIZES[size], moodClass, className)} />
  )
}

export function defaultAvatar() {
  return makeAvatarId('adventurer', randomSeed(), AVATAR_BACKGROUNDS[Math.floor(Math.random() * AVATAR_BACKGROUNDS.length)])
}

export function AvatarPicker({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const current = parseAvatar(selected) ?? { style: 'adventurer' as AvatarStyle, seed: randomSeed(), bg: AVATAR_BACKGROUNDS[0] }
  const [seeds, setSeeds] = useState(() => Array.from({ length: 7 }, randomSeed))

  const pick = (patch: Partial<typeof current>) => {
    const next = { ...current, ...patch }
    onSelect(makeAvatarId(next.style, next.seed, next.bg))
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium tracking-widest uppercase text-stone-500">Your avatar</p>

      <div className="flex items-center gap-4">
        <AvatarDisplay avatarId={selected} size="xl" />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {AVATAR_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pick({ style: s.id })}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full border transition-colors',
                  current.style === s.id ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 text-stone-600 hover:border-stone-400',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Background colour">
            {AVATAR_BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                type="button"
                role="radio"
                aria-checked={current.bg === bg}
                aria-label={`Background ${bg}`}
                onClick={() => pick({ bg })}
                className={cn('w-6 h-6 rounded-full border transition-transform', current.bg === bg ? 'border-stone-900 scale-110' : 'border-stone-200')}
                style={{ backgroundColor: `#${bg}` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {seeds.map((seed) => {
          const id = makeAvatarId(current.style, seed, current.bg)
          return (
            <button
              key={seed}
              type="button"
              onClick={() => pick({ seed })}
              className={cn('rounded-full p-0.5 border-2 transition-colors', current.seed === seed ? 'border-stone-900' : 'border-transparent hover:border-stone-300')}
              aria-label="Choose this look"
            >
              <AvatarDisplay avatarId={id} size="sm" className="w-full h-auto" />
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setSeeds(Array.from({ length: 7 }, randomSeed))}
          className="rounded-full border-2 border-dashed border-stone-200 text-stone-400 text-lg hover:border-stone-400 hover:text-stone-600 transition-colors aspect-square"
          aria-label="Show more looks"
        >
          ↻
        </button>
      </div>
    </div>
  )
}
