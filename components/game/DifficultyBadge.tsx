import { DIFFICULTY_LABEL, type Difficulty } from '@/lib/game/questions/schema'
import { cn } from '@/lib/utils'

const TONE: Record<Difficulty, { light: string; dark: string }> = {
  easy: { light: 'bg-emerald-50 text-emerald-700', dark: 'bg-emerald-900/40 text-emerald-300' },
  medium: { light: 'bg-amber-50 text-amber-700', dark: 'bg-amber-900/40 text-amber-300' },
  hard: { light: 'bg-rose-50 text-rose-700', dark: 'bg-rose-900/40 text-rose-300' },
}

export function DifficultyBadge({ level, dark = false, className }: { level?: Difficulty; dark?: boolean; className?: string }) {
  if (!level) return null
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide', dark ? TONE[level].dark : TONE[level].light, className)}>
      {DIFFICULTY_LABEL[level]}
    </span>
  )
}
