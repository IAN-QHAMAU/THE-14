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

export type AvatarMood = 'happy' | 'sad' | null

// Avatar artwork is large, so each style loads on first use. Moods swap only
// the face (mouth, eyes, brows), so the character keeps its hair and look and
// actually smiles when you are right and sulks when you are not.
type Options = Record<string, unknown>
interface StyleDef {
  load: () => Promise<unknown>
  /** Only for newer styles; existing styles keep their look unchanged. */
  base?: Options
  happy: Options
  sad: Options
}
const STYLES: Record<AvatarStyle, StyleDef> = {
  adventurer: {
    load: () => import('@dicebear/adventurer'),
    happy: { mouth: ['variant23', 'variant24', 'variant26'] },
    sad: { mouth: ['variant13', 'variant14'] },
  },
  lorelei: {
    load: () => import('@dicebear/lorelei'),
    happy: { mouth: ['happy01', 'happy02', 'happy04', 'happy07', 'happy09'] },
    sad: { mouth: ['sad01', 'sad02', 'sad04', 'sad06'] },
  },
  bigSmile: {
    load: () => import('@dicebear/big-smile'),
    happy: { mouth: ['openedSmile', 'teethSmile', 'gapSmile'], eyes: ['cheery', 'starstruck'] },
    sad: { mouth: ['openSad'], eyes: ['sad'] },
  },
  micah: {
    load: () => import('@dicebear/micah'),
    happy: { mouth: ['laughing', 'smile'], eyes: ['smiling'] },
    sad: { mouth: ['sad', 'frown'], eyebrows: ['down'] },
  },
  openPeeps: {
    load: () => import('@dicebear/open-peeps'),
    base: { face: ['calm', 'cheeky', 'cute', 'smile', 'smileBig', 'explaining', 'driven', 'lovingGrin1'] },
    happy: { face: ['smileLOL', 'smileBig', 'lovingGrin2', 'smileTeethGap'] },
    sad: { face: ['concerned', 'concernedFear', 'tired'] },
  },
  toonHead: {
    load: () => import('@dicebear/toon-head'),
    base: { mouth: ['smile', 'laugh', 'agape'], eyebrows: ['raised', 'happy', 'neutral'] },
    happy: { mouth: ['laugh'], eyes: ['happy'], eyebrows: ['happy'] },
    sad: { mouth: ['sad'], eyes: ['humble'], eyebrows: ['sad'] },
  },
  avataaars: {
    load: () => import('@dicebear/avataaars'),
    base: {
      mouth: ['default', 'smile', 'twinkle', 'serious'],
      eyes: ['default', 'happy', 'side', 'squint', 'wink'],
      eyebrows: ['defaultNatural', 'flatNatural', 'raisedExcitedNatural', 'upDownNatural'],
    },
    happy: { mouth: ['smile', 'twinkle'], eyes: ['happy'], eyebrows: ['raisedExcitedNatural'] },
    sad: { mouth: ['sad', 'concerned'], eyes: ['cry'], eyebrows: ['sadConcernedNatural'] },
  },
  personas: {
    load: () => import('@dicebear/personas'),
    base: { mouth: ['smile', 'bigSmile', 'smirk', 'lips'], eyes: ['open', 'happy', 'wink'] },
    happy: { mouth: ['bigSmile'], eyes: ['happy'] },
    sad: { mouth: ['frown'] },
  },
}

type Renderer = (seed: string, bg: string, mood: AvatarMood) => string
const renderers = new Map<AvatarStyle, Promise<Renderer>>()
const cache = new Map<string, string>()

function loadRenderer(style: AvatarStyle): Promise<Renderer> {
  let p = renderers.get(style)
  if (!p) {
    const def = STYLES[style]
    p = Promise.all([import('@dicebear/core'), def.load()]).then(([core, mod]) => {
      const styleDef = mod as Parameters<typeof core.createAvatar>[0]
      return (seed: string, bg: string, mood: AvatarMood) =>
        core
          .createAvatar(styleDef, { seed, backgroundColor: [bg], radius: 50, ...def.base, ...(mood ? def[mood] : null) })
          .toDataUri()
    })
    renderers.set(style, p)
  }
  return p
}

function useAvatarUri(style: AvatarStyle | undefined, seed: string | undefined, bg: string | undefined, mood: AvatarMood = null) {
  const key = style && seed && bg ? `${style}:${seed}:${bg}:${mood ?? ''}` : null
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
        const out = render(seed, bg, mood)
        cache.set(key, out)
        if (alive) setUri(out)
      })
      .catch(() => {
        // Keep the plain circle if the artwork fails to load.
      })
    return () => {
      alive = false
    }
  }, [key, style, seed, bg, mood])

  return uri
}

const SIZES = {
  xs: 'w-6 h-6 text-sm',
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-4xl',
  xl: 'w-24 h-24 text-5xl',
}

export function AvatarDisplay({
  avatarId,
  size = 'md',
  mood = null,
  idle = false,
  className,
  style,
}: {
  avatarId: string
  size?: keyof typeof SIZES
  mood?: AvatarMood
  /** A slow, gentle sway, for avatars waiting around in the lobby. */
  idle?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const parsed = parseAvatar(avatarId)
  const base = useAvatarUri(parsed?.style, parsed?.seed, parsed?.bg)
  const faced = useAvatarUri(parsed?.style, parsed?.seed, parsed?.bg, mood)
  const uri = faced ?? base
  const moodClass = mood === 'happy' ? 'motion-safe:animate-avatar-hop' : mood === 'sad' ? 'motion-safe:animate-avatar-droop grayscale-[40%]' : idle ? 'motion-safe:animate-avatar-idle' : ''

  if (parsed && !uri) {
    return <span className={cn('inline-block rounded-full flex-shrink-0', SIZES[size], className)} style={{ ...style, backgroundColor: `#${parsed.bg}` }} />
  }

  if (!uri) {
    return (
      <span className={cn('inline-flex items-center justify-center rounded-full bg-stone-100 flex-shrink-0', SIZES[size], moodClass, className)} style={style}>
        {LEGACY_AVATARS[avatarId] ?? '👤'}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={uri} alt="" draggable={false} className={cn('rounded-full flex-shrink-0 select-none', SIZES[size], moodClass, className)} style={style} />
  )
}

/** Data URI for an avatar, or null for legacy emoji avatars. Used by the share card. */
export async function getAvatarDataUri(avatarId: string, mood: AvatarMood = null): Promise<string | null> {
  const parsed = parseAvatar(avatarId)
  if (!parsed) return null
  const key = `${parsed.style}:${parsed.seed}:${parsed.bg}:${mood ?? ''}`
  const hit = cache.get(key)
  if (hit) return hit
  const render = await loadRenderer(parsed.style)
  const out = render(parsed.seed, parsed.bg, mood)
  cache.set(key, out)
  return out
}

export function legacyEmoji(avatarId: string) {
  return LEGACY_AVATARS[avatarId] ?? '👤'
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
