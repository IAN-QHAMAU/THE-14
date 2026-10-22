'use client'
import { getAvatarDataUri, legacyEmoji, type AvatarMood } from '@/components/ui/Avatar'
import { parseAvatar } from '@/lib/avatar'
import type { Award, PlayerScoreEntry, PlayerStats, PlayerTag } from '@/types'

// Result cards are drawn on a canvas at 1080 x 1920, the size WhatsApp and
// Instagram use for status and stories, so they stay sharp on any screen.
// Two layouts: a personal card for each player, and a group card for the GM.

const W = 1080
const H = 1920
const PAD = 80
// Instagram and WhatsApp cover the top and bottom of a story with the
// profile row, music sticker and reply box, so content stays between these.
const SAFE_TOP = 250
const SAFE_BOTTOM = H - 290

const C = {
  bg: '#1c1917',
  panel: '#292524',
  panelHi: '#44403c',
  line: '#44403c',
  text: '#fafaf9',
  soft: '#d6d3d1',
  muted: '#a8a29e',
  faint: '#78716c',
  gold: '#ecc98e',
  silver: '#57534e',
  bronze: '#44403c',
  good: '#34d399',
  brand: '#f2a541',
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

  // A faint warm light from the bottom corner, in the brand amber.
  const warm = ctx.createRadialGradient(W, H, 0, W, H, 900)
  warm.addColorStop(0, rgba('f2a541', 0.07))
  warm.addColorStop(1, rgba('f2a541', 0))
  ctx.fillStyle = warm
  ctx.fillRect(0, 0, W, H)

  // Fine grain, so it feels printed rather than flat.
  const grain = ctx.getImageData(0, 0, W, H)
  const d = grain.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 10
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(grain, 0, 0)

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

async function drawAvatar(ctx: CanvasRenderingContext2D, avatarId: string, x: number, y: number, size: number, font: string, mood: AvatarMood = null) {
  const uri = await getAvatarDataUri(avatarId, mood).catch(() => null)
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
  // The brand mark: a small amber tile before the name.
  roundRect(ctx, PAD, SAFE_TOP - 34, 30, 30, 8)
  ctx.fillStyle = C.brand
  ctx.fill()
  ctx.fillStyle = C.text
  ctx.font = `300 52px ${font}`
  ctx.fillText('THE 14', PAD + 46, SAFE_TOP)
  label({ ctx, font }, new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }), W - PAD, SAFE_TOP - 6, 'right')
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAD, SAFE_TOP + 36)
  ctx.lineTo(W - PAD, SAFE_TOP + 36)
  ctx.stroke()
}

function footer({ ctx, font }: Ctx) {
  ctx.fillStyle = C.faint
  ctx.font = `400 26px ${font}`
  ctx.textAlign = 'center'
  ctx.fillText('Kwani me hudoo.', W / 2, SAFE_BOTTOM + 60)
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

// ─── Collector card pieces ───────────────────────────────────────────────

const CARD = { x: 44, y: SAFE_TOP - 100, w: W - 88, h: SAFE_BOTTOM - SAFE_TOP + 200, r: 52 }

/** The card body: a slightly raised panel with a holographic foil edge. */
function cardBody(ctx: CanvasRenderingContext2D) {
  roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r)
  const body = ctx.createLinearGradient(0, CARD.y, 0, CARD.y + CARD.h)
  body.addColorStop(0, 'rgba(255, 250, 245, 0.045)')
  body.addColorStop(1, 'rgba(255, 250, 245, 0.015)')
  ctx.fillStyle = body
  ctx.fill()
  // Foil: a soft amber, rose and blue sheen running along the edge.
  const foil = ctx.createLinearGradient(CARD.x, CARD.y, CARD.x + CARD.w, CARD.y + CARD.h)
  foil.addColorStop(0, 'rgba(242, 165, 65, 0.55)')
  foil.addColorStop(0.3, 'rgba(242, 141, 178, 0.35)')
  foil.addColorStop(0.55, 'rgba(127, 167, 245, 0.35)')
  foil.addColorStop(0.8, 'rgba(108, 203, 139, 0.25)')
  foil.addColorStop(1, 'rgba(242, 165, 65, 0.5)')
  ctx.strokeStyle = foil
  ctx.lineWidth = 3
  ctx.stroke()
  // A second hairline just inside, like a printed border.
  roundRect(ctx, CARD.x + 16, CARD.y + 16, CARD.w - 32, CARD.h - 32, CARD.r - 14)
  ctx.strokeStyle = 'rgba(250, 250, 249, 0.05)'
  ctx.lineWidth = 2
  ctx.stroke()
}

/** Clip drawing to the card so big shapes bleed off its edges, not the image. */
function clipToCard(ctx: CanvasRenderingContext2D, draw: () => void) {
  ctx.save()
  roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r)
  ctx.clip()
  draw()
  ctx.restore()
}

/** An arch: round on top, softly squared at the bottom. */
function archPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, extendUp = 0) {
  const r = w / 2
  const br = Math.min(28, w / 6)
  ctx.beginPath()
  if (extendUp) {
    // Same sides, but open far above the arch so a head can break out.
    ctx.moveTo(x - extendUp, y - extendUp)
    ctx.lineTo(x + w + extendUp, y - extendUp)
    ctx.lineTo(x + w + extendUp, y + r)
    ctx.lineTo(x + w, y + r)
  } else {
    ctx.moveTo(x, y + r)
    ctx.arc(x + r, y + r, r, Math.PI, 0)
  }
  ctx.lineTo(x + w, y + h - br)
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
  ctx.lineTo(x + br, y + h)
  ctx.arcTo(x, y + h, x, y + h - br, br)
  if (extendUp) {
    ctx.lineTo(x, y + r)
    ctx.lineTo(x - extendUp, y + r)
  }
  ctx.closePath()
}

function lighten(hex: string, amt: number) {
  const n = parseInt(hex, 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amt)
  return ((mix((n >> 16) & 255) << 16) | (mix((n >> 8) & 255) << 8) | mix(n & 255)).toString(16).padStart(6, '0')
}

function darken(hex: string, amt: number) {
  const n = parseInt(hex, 16)
  const mix = (c: number) => Math.round(c * (1 - amt))
  return ((mix((n >> 16) & 255) << 16) | (mix((n >> 8) & 255) << 8) | mix(n & 255)).toString(16).padStart(6, '0')
}

/**
 * A character standing in an arch of their own colour, with the head
 * breaking out over the top edge.
 */
async function portrait(
  ctx: CanvasRenderingContext2D,
  avatarId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  font: string,
  mood: AvatarMood = null,
) {
  const colour = accentOf(avatarId)
  archPath(ctx, x, y, w, h)
  const fill = ctx.createLinearGradient(0, y, 0, y + h)
  fill.addColorStop(0, `#${lighten(colour, 0.25)}`)
  fill.addColorStop(1, `#${darken(colour, 0.12)}`)
  ctx.fillStyle = fill
  ctx.fill()
  // A soft light behind the head.
  const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.38, 0, x + w / 2, y + h * 0.38, w * 0.6)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.35)')
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = glow
  ctx.fill()

  const uri = await getAvatarDataUri(avatarId, mood, true).catch(() => null)
  const img = uri ? await loadImage(uri) : null
  ctx.save()
  archPath(ctx, x, y, w, h, w * 0.4)
  ctx.clip()
  if (img) {
    // Drawn larger than the arch and lifted, so the head breaks out over the top.
    const size = w * 1.32
    ctx.drawImage(img, x + (w - size) / 2, y + h - size * 1.06, size, size)
  } else {
    ctx.fillStyle = C.text
    ctx.font = `${Math.round(w * 0.5)}px ${font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(legacyEmoji(avatarId), x + w / 2, y + h / 2)
    ctx.textBaseline = 'alphabetic'
  }
  ctx.restore()
}

/** A ticket stub panel, with a perforated tear line when `tearY` is given. */
function ticket(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tearY: number | null) {
  // What shows through the notches: the card just beside the panel.
  const px = ctx.getImageData(Math.max(0, x - 12), tearY ?? y, 1, 1).data
  roundRect(ctx, x, y, w, h, 34)
  ctx.fillStyle = 'rgba(255, 250, 245, 0.05)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(250, 250, 249, 0.06)'
  ctx.lineWidth = 2
  ctx.stroke()
  if (tearY === null) return
  // Notches cut into each side at the tear line.
  ctx.fillStyle = `rgb(${px[0]}, ${px[1]}, ${px[2]})`
  for (const cx of [x, x + w]) {
    ctx.beginPath()
    ctx.arc(cx, tearY, 22, 0, Math.PI * 2)
    ctx.fill()
  }
  // Dashed perforation between the notches.
  ctx.save()
  ctx.setLineDash([10, 12])
  ctx.strokeStyle = 'rgba(250, 250, 249, 0.16)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + 36, tearY)
  ctx.lineTo(x + w - 36, tearY)
  ctx.stroke()
  ctx.restore()
}

/** Top three in a row: 2nd, 1st, 3rd, each in a small arch of their colour. */
async function podiumArches(
  c: Ctx,
  rows: StandingRow[],
  tags: Record<string, PlayerTag>,
  base: number,
  scale: number,
  highlight?: string,
) {
  const { ctx, font } = c
  const order = [rows[1], rows[0], rows[2]]
  const widths = [200, 240, 200].map((v) => v * scale)
  const heights = [230, 290, 200].map((v) => v * scale)
  const gap = 34 * scale
  const total = widths.reduce((a, b) => a + b, 0) + gap * 2
  let x = (W - total) / 2
  for (let i = 0; i < 3; i++) {
    const r = order[i]
    const w = widths[i]
    const h = heights[i]
    if (r) {
      const top = base - h
      await portrait(ctx, r.entry.avatar, x, top, w, h, font, r.rank === 1 ? 'happy' : null)
      // Place chip at the foot of the arch.
      const chipW = 84 * scale
      const chipH = 44 * scale
      roundRect(ctx, x + (w - chipW) / 2, base - chipH / 2, chipW, chipH, chipH / 2)
      ctx.fillStyle = r.rank === 1 ? C.brand : '#2a2522'
      ctx.fill()
      ctx.fillStyle = r.rank === 1 ? '#2B1D0A' : C.soft
      ctx.font = `600 ${Math.round(22 * scale)}px ${font}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ordinal(r.rank), x + w / 2, base + 1)
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = r.entry.player_id === highlight ? C.text : C.soft
      ctx.font = `500 ${Math.round(28 * scale)}px ${font}`
      ctx.fillText(fitText(ctx, r.entry.name, w + gap - 8), x + w / 2, base + 62 * scale)
      ctx.fillStyle = C.muted
      ctx.font = `400 ${Math.round(23 * scale)}px ${font}`
      const tag = tags[r.entry.player_id]?.title
      ctx.fillText(fitText(ctx, tag ? `${r.entry.total.toLocaleString()}  ·  ${tag}` : r.entry.total.toLocaleString(), w + gap - 8), x + w / 2, base + 98 * scale)
    }
    x += w + gap
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

  // A huge, faint rank number behind everything, bleeding off the card.
  clipToCard(ctx, () => {
    ctx.fillStyle = rgba(accent, 0.1)
    ctx.font = `200 760px ${font}`
    ctx.textAlign = 'right'
    spaced(ctx, -30)
    ctx.fillText(String(rank), CARD.x + CARD.w + 40, SAFE_TOP + 700)
    spaced(ctx, 0)
  })

  // Portrait.
  const archW = 330
  const archH = 380
  const archY = SAFE_TOP + 92
  await portrait(ctx, me.avatar, (W - archW) / 2, archY, archW, archH, font, rank <= 3 ? 'happy' : null)
  // Rank seal on the arch's shoulder.
  const sealX = (W + archW) / 2 - 18
  const sealY = archY + 64
  ctx.beginPath()
  ctx.arc(sealX, sealY, 46, 0, Math.PI * 2)
  ctx.fillStyle = rank === 1 ? C.brand : '#2a2522'
  ctx.fill()
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.9)'
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.fillStyle = rank === 1 ? '#2B1D0A' : C.text
  ctx.font = `600 30px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(ordinal(rank), sealX, sealY + 1)
  ctx.textBaseline = 'alphabetic'

  // Name, place and points.
  const nameY = archY + archH + 66
  ctx.fillStyle = C.muted
  ctx.font = `500 30px ${font}`
  spaced(ctx, 6)
  ctx.fillText(fitText(ctx, me.name.toUpperCase(), W - PAD * 2), W / 2, nameY)
  spaced(ctx, 0)
  const placeY = nameY + 116
  ctx.fillStyle = C.text
  ctx.font = `300 112px ${font}`
  spaced(ctx, -3)
  ctx.fillText(rank === 1 ? 'Winner' : `${ordinal(rank)} place`, W / 2, placeY)
  spaced(ctx, 0)
  const pointsY = placeY + 52
  ctx.fillStyle = C.muted
  ctx.font = `400 30px ${font}`
  ctx.fillText(`${me.total.toLocaleString()} points  ·  ${sorted.length} players`, W / 2, pointsY)

  // Ticket stub: tag and stats above the tear, the podium below it.
  const tY = pointsY + 44
  const tH = SAFE_BOTTOM - tY
  const tearY = tY + (tag ? 214 : 170)
  ticket(ctx, PAD, tY, W - PAD * 2, tH, tearY)

  if (tag) {
    ctx.fillStyle = C.text
    ctx.font = `500 34px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText(tag.title, W / 2, tY + 60)
    if (tag.detail) {
      ctx.fillStyle = C.muted
      ctx.font = `400 26px ${font}`
      ctx.fillText(tag.detail, W / 2, tY + 96)
    }
  }
  if (s) {
    const cells = [
      { value: s.graded ? `${s.correct}/${s.graded}` : String(s.correct), label: 'Right' },
      { value: String(s.bestStreak), label: 'Best streak' },
      { value: s.avgMs != null ? `${(s.avgMs / 1000).toFixed(1)}s` : '-', label: 'Avg speed' },
    ]
    const cw = (W - PAD * 2) / 3
    const vy = tag ? tY + 150 : tY + 104
    cells.forEach((cell, i) => {
      const cx = PAD + cw * i + cw / 2
      ctx.fillStyle = C.text
      ctx.font = `300 44px ${font}`
      ctx.textAlign = 'center'
      ctx.fillText(cell.value, cx, vy)
      label(c, cell.label, cx, vy + 30, 'center')
      if (i > 0) {
        ctx.fillStyle = 'rgba(250, 250, 249, 0.08)'
        ctx.fillRect(PAD + cw * i, vy - 38, 2, 76)
      }
    })
  }

  // Podium below the tear.
  const all = rankRows(input.scores)
  const mine = all.find((r) => r.entry.player_id === me.player_id)
  const inTop = all.slice(0, 3).some((r) => r.entry.player_id === me.player_id)
  const scale = !inTop && mine ? 0.6 : 0.72
  const below = SAFE_BOTTOM - tearY
  // Podium plus names, and your own row under it when you are not in the top 3.
  const block = 290 * scale + 100 * scale + (scale < 0.7 ? 120 : 0)
  const base = tearY + Math.max(36, (below - block) / 2) + 290 * scale
  await podiumArches(c, all, input.tags, base, scale, me.player_id)
  if (!inTop && mine) {
    await standings(c, input, [mine], {
      top: base + 100 * scale - 14,
      bottom: base + 100 * scale - 14 + 30 + 92,
      title: '',
      highlight: me.player_id,
      accent,
      details: true,
    })
  }
}

async function groupCard(c: Ctx, input: ShareCardInput) {
  const { ctx, font } = c
  const sorted = [...input.scores].sort((a, b) => b.total - a.total)

  ctx.textAlign = 'center'
  ctx.fillStyle = C.text
  ctx.font = `300 84px ${font}`
  spaced(ctx, -2)
  ctx.fillText('Final results', W / 2, SAFE_TOP + 150)
  spaced(ctx, 0)
  label(c, `${sorted.length} players`, W / 2, SAFE_TOP + 202, 'center')

  const rows = rankRows(input.scores)
  const rest = rows.slice(3)
  if (!rest.length) {
    // Just the top three: a bigger podium in the middle of the card.
    await podiumArches(c, rows, input.tags, SAFE_TOP + 900, 1.15)
    return
  }
  // The list panel grows with the number of players, and the podium and list
  // sit together in the middle of the card.
  const cols = rest.length > 8 ? 2 : 1
  const perCol = Math.ceil(rest.length / cols)
  const listH = 20 + perCol * 100 + (perCol - 1) * 14 + 20
  const spare = Math.max(0, SAFE_BOTTOM - (SAFE_TOP + 710 + listH))
  const base = SAFE_TOP + 560 + spare / 2
  await podiumArches(c, rows, input.tags, base, 1)
  const tY = base + 150
  const tB = Math.min(SAFE_BOTTOM, tY + listH)
  ticket(ctx, PAD, tY, W - PAD * 2, tB - tY, null)
  await standings(c, input, rest, { top: tY - 10, bottom: tB - 20, title: '', details: rest.length <= 6 })
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
  background(ctx, accent, input.mode === 'player' ? SAFE_TOP + 260 : SAFE_TOP + 380)
  cardBody(ctx)
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
