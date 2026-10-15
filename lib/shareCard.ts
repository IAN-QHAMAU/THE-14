'use client'
import { getAvatarDataUri, legacyEmoji } from '@/components/ui/Avatar'
import { parseAvatar } from '@/lib/avatar'
import type { Award, PlayerScoreEntry, PlayerStats, PlayerTag } from '@/types'

// Result cards are drawn on a canvas at 1080 x 1920, the size WhatsApp and
// Instagram use for status and stories, so they stay sharp on any screen.
// Two layouts: a personal card for each player, and a group card for the GM.

const W = 1080
const H = 1920
const PAD = 80

const C = {
  bg: '#1c1917',
  panel: '#292524',
  panelHi: '#44403c',
  line: '#44403c',
  text: '#fafaf9',
  soft: '#d6d3d1',
  muted: '#a8a29e',
  faint: '#78716c',
  gold: '#e7e5e4',
  silver: '#57534e',
  bronze: '#44403c',
  good: '#34d399',
}

// Muted medal tones for ranks 1 to 3.
const MEDAL = ['#d9c7a3', '#c9c6c2', '#c9a184']
const DEFAULT_ACCENT = 'e7e5e4'

function rgba(hex: string, a: number) {
  const n = parseInt(hex, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function accentOf(avatarId?: string) {
  return parseAvatar(avatarId)?.bg ?? DEFAULT_ACCENT
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // Letter spacing is supported in recent Chrome and Safari; ignored elsewhere.
  ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${px}px`
}

function label(c: Ctx, text: string, x: number, y: number, align: CanvasTextAlign = 'left') {
  const { ctx, font } = c
  ctx.textAlign = align
  ctx.fillStyle = C.faint
  ctx.font = `500 22px ${font}`
  spaced(ctx, 3)
  ctx.fillText(text.toUpperCase(), x, y)
  spaced(ctx, 0)
}

function background(ctx: CanvasRenderingContext2D, accent: string, glowY: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#201c1a')
  g.addColorStop(1, '#161311')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const r = ctx.createRadialGradient(W / 2, glowY, 0, W / 2, glowY, 520)
  r.addColorStop(0, rgba(accent, 0.13))
  r.addColorStop(1, rgba(accent, 0))
  ctx.fillStyle = r
  ctx.fillRect(0, 0, W, H)
}

export function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

async function drawAvatar(ctx: CanvasRenderingContext2D, avatarId: string, x: number, y: number, size: number, font: string) {
  const uri = await getAvatarDataUri(avatarId).catch(() => null)
  const img = uri ? await loadImage(uri) : null
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  if (img) {
    ctx.clip()
    ctx.drawImage(img, x, y, size, size)
  } else {
    ctx.fillStyle = C.panel
    ctx.fill()
    ctx.fillStyle = C.text
    ctx.font = `${Math.round(size * 0.55)}px ${font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(legacyEmoji(avatarId), x + size / 2, y + size / 2 + size * 0.04)
  }
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h / 2, w / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
  return t + '…'
}

export interface ShareCardInput {
  mode: 'player' | 'group'
  /** Required for the player card. */
  me?: PlayerScoreEntry
  scores: PlayerScoreEntry[]
  awards: Award[]
  tags: Record<string, PlayerTag>
  stats: Record<string, PlayerStats>
}

interface Ctx {
  ctx: CanvasRenderingContext2D
  font: string
}

function header({ ctx, font }: Ctx) {
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = C.text
  ctx.font = `300 52px ${font}`
  ctx.fillText('THE 14', PAD, 130)
  label({ ctx, font }, new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }), W - PAD, 124, 'right')
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAD, 170)
  ctx.lineTo(W - PAD, 170)
  ctx.stroke()
}

function footer({ ctx, font }: Ctx) {
  ctx.fillStyle = C.faint
  ctx.font = `400 26px ${font}`
  ctx.textAlign = 'center'
  ctx.fillText('Kwani me hudoo.', W / 2, H - 70)
}

interface StandingRow {
  entry: PlayerScoreEntry
  rank: number
}

function rankRows(scores: PlayerScoreEntry[]): StandingRow[] {
  const sorted = [...scores].sort((a, b) => b.total - a.total)
  return sorted.map((entry) => ({ entry, rank: sorted.filter((o) => o.total > entry.total).length + 1 }))
}

/**
 * Standings rows with tags. Two columns when there are many rows. A divider
 * can separate the top rows from the viewer's own row further down.
 */
async function standings(
  c: Ctx,
  input: ShareCardInput,
  rows: StandingRow[],
  opts: { top: number; bottom: number; title: string; highlight?: string; accent?: string; dividerBefore?: number; details?: boolean },
) {
  const { ctx, font } = c
  const accent = opts.accent ?? DEFAULT_ACCENT
  label(c, opts.title, PAD, opts.top)

  const cols = rows.length > 8 ? 2 : 1
  const perCol = Math.ceil(rows.length / cols)
  const colGap = 20
  const colW = (W - PAD * 2 - colGap * (cols - 1)) / cols
  const listTop = opts.top + 30
  const gap = cols === 2 ? 10 : 14
  const divider = opts.dividerBefore !== undefined && cols === 1 ? 44 : 0
  const rowH = Math.min(cols === 2 ? 104 : 100, Math.floor((opts.bottom - listTop - divider - gap * (perCol - 1)) / Math.max(1, perCol)))
  const av = Math.round(rowH * 0.64)
  const nameSize = Math.round(Math.min(cols === 2 ? 30 : 34, rowH * 0.34))
  const tagSize = Math.round(Math.min(cols === 2 ? 21 : 25, rowH * 0.27))
  const scoreW = cols === 2 ? 96 : 160

  for (let i = 0; i < rows.length; i++) {
    const { entry: e, rank } = rows[i]
    const col = Math.floor(i / perCol)
    const x0 = PAD + col * (colW + colGap)
    let y = listTop + (i % perCol) * (rowH + gap)
    if (divider && i >= opts.dividerBefore!) y += divider
    const isMe = e.player_id === opts.highlight

    if (divider && i === opts.dividerBefore) {
      // Three soft dots between the top rows and your own row.
      ctx.fillStyle = C.faint
      for (let d = -1; d <= 1; d++) {
        ctx.beginPath()
        ctx.arc(W / 2 + d * 18, y - gap / 2 - divider / 2, 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    roundRect(ctx, x0, y, colW, rowH, 20)
    ctx.fillStyle = isMe ? rgba(accent, 0.14) : 'rgba(255, 255, 255, 0.045)'
    ctx.fill()
    if (isMe) {
      ctx.strokeStyle = rgba(accent, 0.55)
      ctx.lineWidth = 2
      ctx.stroke()
    }

    const mid = y + rowH / 2
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = rank <= 3 ? MEDAL[rank - 1] : C.faint
    ctx.font = `500 ${Math.round(nameSize * 0.9)}px ${font}`
    ctx.fillText(String(rank), x0 + 36, mid)

    await drawAvatar(ctx, e.avatar, x0 + 66, mid - av / 2, av, font)

    const textX = x0 + 66 + av + 20
    const maxText = x0 + colW - scoreW - textX
    const tag = input.tags[e.player_id]
    ctx.textAlign = 'left'
    ctx.fillStyle = isMe ? C.text : C.soft
    ctx.font = `500 ${nameSize}px ${font}`
    ctx.fillText(fitText(ctx, e.name, maxText), textX, tag ? mid - rowH * 0.16 : mid)
    if (tag) {
      ctx.fillStyle = C.muted
      ctx.font = `400 ${tagSize}px ${font}`
      const text = opts.details && tag.detail ? `${tag.title}  ·  ${tag.detail}` : tag.title
      ctx.fillText(fitText(ctx, text, maxText), textX, mid + rowH * 0.2)
    }

    ctx.textAlign = 'right'
    ctx.fillStyle = isMe ? C.text : C.soft
    ctx.font = `400 ${nameSize}px ${font}`
    ctx.fillText(e.total.toLocaleString(), x0 + colW - 24, mid)
    ctx.textBaseline = 'alphabetic'
  }
}

function statTiles(c: Ctx, tiles: { value: string; label: string }[], y: number, h: number) {
  const { ctx, font } = c
  const gap = 20
  const w = (W - PAD * 2 - gap * (tiles.length - 1)) / tiles.length
  tiles.forEach((t, i) => {
    const x = PAD + i * (w + gap)
    roundRect(ctx, x, y, w, h, 22)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)'
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = C.text
    ctx.font = `300 ${Math.round(h * 0.36)}px ${font}`
    ctx.fillText(t.value, x + w / 2, y + h * 0.5)
    label(c, t.label, x + w / 2, y + h * 0.8, 'center')
  })
}

/**
 * Mini podium: 2nd, 1st, 3rd on blocks. `scale` shrinks it for the player
 * card; the viewer's own spot gets a ring in their colour.
 */
async function miniPodium(
  c: Ctx,
  rows: StandingRow[],
  tags: Record<string, PlayerTag>,
  base: number,
  scale = 1,
  highlight?: string,
  accent = DEFAULT_ACCENT,
) {
  const { ctx, font } = c
  const byPlace = (n: number) => rows[n]
  const slots = [
    { r: byPlace(1), h: 110, color: C.silver, text: C.soft },
    { r: byPlace(0), h: 160, color: C.gold, text: C.bg },
    { r: byPlace(2), h: 80, color: C.bronze, text: C.muted },
  ]
  const colW = 230 * scale
  const colGap = 30 * scale
  const startX = (W - (colW * 3 + colGap * 2)) / 2
  for (let i = 0; i < slots.length; i++) {
    const { r, h: rawH, color, text } = slots[i]
    if (!r) continue
    const e = r.entry
    const h = rawH * scale
    const x = startX + i * (colW + colGap)
    const blockTop = base - h
    const av = Math.round(104 * scale)
    const avY = blockTop - av - 100 * scale
    if (e.player_id === highlight) {
      ctx.beginPath()
      ctx.arc(x + colW / 2, avY + av / 2, av / 2 + 8, 0, Math.PI * 2)
      ctx.strokeStyle = rgba(accent, 0.7)
      ctx.lineWidth = 3
      ctx.stroke()
    }
    await drawAvatar(ctx, e.avatar, x + (colW - av) / 2, avY, av, font)
    ctx.textAlign = 'center'
    ctx.fillStyle = e.player_id === highlight ? C.text : C.soft
    ctx.font = `500 ${Math.round(28 * scale)}px ${font}`
    ctx.fillText(fitText(ctx, e.name, colW - 10), x + colW / 2, blockTop - 56 * scale)
    const tag = tags[e.player_id]?.title
    if (tag) {
      ctx.fillStyle = C.muted
      ctx.font = `400 ${Math.round(22 * scale)}px ${font}`
      ctx.fillText(fitText(ctx, tag, colW - 10), x + colW / 2, blockTop - 22 * scale)
    }
    roundRect(ctx, x, blockTop, colW, h, 18 * scale)
    ctx.fillStyle = color
    ctx.fill()
    ctx.fillStyle = text
    ctx.font = `300 ${Math.round(34 * scale)}px ${font}`
    ctx.fillText(ordinal(r.rank), x + colW / 2, blockTop + 48 * scale)
  }
}

async function playerCard(c: Ctx, input: ShareCardInput) {
  const { ctx, font } = c
  const me = input.me!
  const sorted = [...input.scores].sort((a, b) => b.total - a.total)
  const rank = sorted.filter((o) => o.total > me.total).length + 1
  const tag = input.tags[me.player_id]
  const s = input.stats[me.player_id]
  const accent = accentOf(me.avatar)

  const hero = 200
  const heroY = 215
  const nameY = heroY + hero + 66
  const placeSize = 112
  const placeY = nameY + placeSize + 4
  const pointsY = placeY + 54
  const chipY = pointsY + 38
  const tilesY = chipY + 100
  const tilesH = 122

  // Thin ring around the avatar.
  ctx.beginPath()
  ctx.arc(W / 2, heroY + hero / 2, hero / 2 + 12, 0, Math.PI * 2)
  ctx.strokeStyle = rgba(accent, 0.45)
  ctx.lineWidth = 3
  ctx.stroke()
  await drawAvatar(ctx, me.avatar, (W - hero) / 2, heroY, hero, font)

  ctx.textAlign = 'center'
  ctx.fillStyle = C.soft
  ctx.font = `500 44px ${font}`
  ctx.fillText(fitText(ctx, me.name, W - PAD * 2), W / 2, nameY)

  ctx.fillStyle = C.text
  ctx.font = `300 ${placeSize}px ${font}`
  spaced(ctx, -2)
  ctx.fillText(rank === 1 ? 'Winner' : `${ordinal(rank)} place`, W / 2, placeY)
  spaced(ctx, 0)

  ctx.fillStyle = C.muted
  ctx.font = `400 32px ${font}`
  ctx.fillText(`${me.total.toLocaleString()} points  ·  ${sorted.length} players`, W / 2, pointsY)

  if (tag) {
    ctx.font = `500 32px ${font}`
    const tw = ctx.measureText(tag.title).width
    ctx.font = `400 27px ${font}`
    const dw = tag.detail ? ctx.measureText(tag.detail).width : 0
    const w = Math.min(W - PAD * 2, tw + (dw ? dw + 32 : 0) + 68)
    const x = (W - w) / 2
    roundRect(ctx, x, chipY, w, 72, 36)
    ctx.fillStyle = rgba(accent, 0.16)
    ctx.fill()
    ctx.strokeStyle = rgba(accent, 0.35)
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = C.text
    ctx.font = `500 32px ${font}`
    ctx.fillText(tag.title, x + 34, chipY + 37)
    if (dw) {
      ctx.fillStyle = C.muted
      ctx.font = `400 27px ${font}`
      ctx.fillText(fitText(ctx, tag.detail, w - tw - 100), x + 34 + tw + 32, chipY + 37)
    }
    ctx.textBaseline = 'alphabetic'
  }

  if (s) {
    statTiles(
      c,
      [
        { value: s.graded ? `${s.correct}/${s.graded}` : String(s.correct), label: 'Right' },
        { value: String(s.bestStreak), label: 'Best streak' },
        { value: s.avgMs != null ? `${(s.avgMs / 1000).toFixed(1)}s` : '-', label: 'Avg speed' },
      ],
      tilesY,
      tilesH,
    )
  }

  // Podium for the top 3, places 4 to 6 below it, then your own row if lower.
  const all = rankRows(input.scores)
  const podiumTop = tilesY + tilesH + 70
  label(c, 'Podium', PAD, podiumTop)
  const scale = 0.92
  // Tallest column: avatar, name, tag and the 1st place block.
  const podiumBase = podiumTop + 30 + Math.round((104 + 100 + 160) * scale)
  await miniPodium(c, all, input.tags, podiumBase, scale, me.player_id, accent)

  const next = all.slice(3, 6)
  const mine = all.find((r) => r.entry.player_id === me.player_id)
  const shown = all.slice(0, 6).some((r) => r.entry.player_id === me.player_id)
  const rows = shown || !mine ? next : [...next, mine]
  if (rows.length) {
    await standings(c, input, rows, {
      top: podiumBase + 16,
      bottom: H - 140,
      title: '',
      highlight: me.player_id,
      accent,
      dividerBefore: shown ? undefined : next.length,
      details: true,
    })
  }
}

async function groupCard(c: Ctx, input: ShareCardInput) {
  const { ctx, font } = c
  const sorted = [...input.scores].sort((a, b) => b.total - a.total)

  ctx.textAlign = 'center'
  ctx.fillStyle = C.text
  ctx.font = `300 76px ${font}`
  ctx.fillText('Final results', W / 2, 285)
  label(c, `${sorted.length} players`, W / 2, 338, 'center')

  await miniPodium(c, rankRows(input.scores), input.tags, 760)

  await standings(c, input, rankRows(input.scores), { top: 850, bottom: H - 150, title: 'Everyone', details: input.scores.length <= 8 })
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob | null> {
  if (typeof document === 'undefined') return null
  if (input.mode === 'player' && !input.me) return null
  try {
    await document.fonts?.ready
  } catch {
    // Fonts API not available, the system font is fine.
  }
  const font = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const accent = input.mode === 'player' ? accentOf(input.me?.avatar) : DEFAULT_ACCENT
  background(ctx, accent, input.mode === 'player' ? 330 : 520)
  const c = { ctx, font }
  header(c)
  if (input.mode === 'player') await playerCard(c, input)
  else await groupCard(c, input)
  footer(c)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

/** Share the card with the phone's share sheet, or download it. */
export async function shareCardImage(blob: Blob, filename = 'the14-result.png') {
  const file = new File([blob], filename, { type: 'image/png' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'THE 14' })
      return 'shared'
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return 'cancelled'
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'saved'
}
