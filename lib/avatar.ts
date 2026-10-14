// Avatar ids look like "av:<style>:<seed>:<background>", for example
// "av:adventurer:k3x9:dbeafe". Older games used emoji ids such as "ninja".

export const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'bigSmile', label: 'Smile' },
  { id: 'micah', label: 'Micah' },
] as const

export type AvatarStyle = (typeof AVATAR_STYLES)[number]['id']

/** Soft, muted backgrounds that sit well on the stone palette. */
export const AVATAR_BACKGROUNDS = ['e7e5e4', 'fde2cf', 'fef3c7', 'dcfce7', 'dbeafe', 'ede9fe', 'fce7f3', 'cffafe']

export const LEGACY_AVATARS: Record<string, string> = {
  ninja: '🥷', robot: '🤖', alien: '👽', ghost: '👻', dragon: '🐉', wizard: '🧙',
  samurai: '⚔️', phoenix: '🔥', wolf: '🐺', lion: '🦁', fox: '🦊', cat: '😺',
}

const STYLE_IDS = AVATAR_STYLES.map((s) => s.id) as string[]
const AVATAR_RE = /^av:([a-zA-Z]+):([A-Za-z0-9]{1,16}):([0-9a-f]{6})$/

export interface ParsedAvatar {
  style: AvatarStyle
  seed: string
  bg: string
}

export function parseAvatar(id: string | null | undefined): ParsedAvatar | null {
  const m = id ? AVATAR_RE.exec(id) : null
  if (!m || !STYLE_IDS.includes(m[1])) return null
  return { style: m[1] as AvatarStyle, seed: m[2], bg: m[3] }
}

export function makeAvatarId(style: AvatarStyle, seed: string, bg: string) {
  return `av:${style}:${seed}:${bg}`
}

export function isValidAvatar(id: unknown): id is string {
  return typeof id === 'string' && (parseAvatar(id) !== null || id in LEGACY_AVATARS)
}

export function randomSeed() {
  return Math.random().toString(36).slice(2, 8)
}
