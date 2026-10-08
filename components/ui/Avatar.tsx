'use client'
import { cn } from '@/lib/utils'

export const AVATARS = [
  { id: 'ninja',    emoji: '🥷' },
  { id: 'robot',    emoji: '🤖' },
  { id: 'alien',    emoji: '👽' },
  { id: 'ghost',    emoji: '👻' },
  { id: 'dragon',   emoji: '🐉' },
  { id: 'wizard',   emoji: '🧙' },
  { id: 'samurai',  emoji: '⚔️' },
  { id: 'phoenix',  emoji: '🔥' },
  { id: 'wolf',     emoji: '🐺' },
  { id: 'lion',     emoji: '🦁' },
  { id: 'fox',      emoji: '🦊' },
  { id: 'cat',      emoji: '😺' },
]

interface AvatarPickerProps {
  selected: string
  onSelect: (id: string) => void
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div>
      <p className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-2">
        Pick your avatar
      </p>
      <div className="grid grid-cols-6 gap-2">
        {AVATARS.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={cn(
              'h-11 w-full flex items-center justify-center text-2xl border-2 transition-all duration-100',
              selected === a.id
                ? 'border-stone-900 bg-stone-100 scale-105'
                : 'border-stone-200 bg-white hover:border-stone-400'
            )}
          >
            {a.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AvatarDisplay({
  avatarId,
  size = 'md',
  className,
}: {
  avatarId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const avatar = AVATARS.find((a) => a.id === avatarId)
  const emoji = avatar?.emoji ?? '👤'
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }
  return <span className={cn(sizes[size], className)}>{emoji}</span>
}
