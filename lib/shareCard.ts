'use client'
import { getAvatarDataUri, legacyEmoji } from '@/components/ui/Avatar'
import type { Award, PlayerScoreEntry } from '@/types'

// Draws a 1080 x 1350 result card (4:5, sits well in WhatsApp, Instagram and
// stories) on a canvas, so the image is sharp at any screen size.

const W = 1080
const H = 1350

const C = {
  bg: '#1c1917',
  panel: '#292524',
  line: '#44403c',
  text: '#fafaf9',
  soft: '#d6d3d1',
  muted: '#a8a29e',
  faint: '#78716c',
  gold: '#e7e5e4',
  silver: '#57534e',
  bronze: '#44403c',
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
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
  return t + '…'
}

export interface ShareCardInput {
  me: PlayerScoreEntry
  rank: number
  totalPlayers: number
  scores: PlayerScoreEntry[]
  awards: Award[]
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob | null> {
  const { me, rank, totalPlayers, scores, awards } = input
  if (typeof document === 'undefined') return null
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

  // Background
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  const pad = 80

  // Header
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = C.text
  ctx.font = `300 52px ${font}`
  ctx.fillText('THE 14', pad, 130)
  ctx.textAlign = 'right'
  ctx.fillStyle = C.faint
  ctx.font = `400 28px ${font}`
  ctx.fillText(new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }), W - pad, 126)

  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pad, 170)
  ctx.lineTo(W - pad, 170)
  ctx.stroke()

  // Hero: avatar, name, placing
  const heroSize = 220
  await drawAvatar(ctx, me.avatar, (W - heroSize) / 2, 215, heroSize, font)

  ctx.textAlign = 'center'
  ctx.fillStyle = C.soft
  ctx.font = `500 46px ${font}`
  ctx.fillText(fitText(ctx, me.name, W - pad * 2), W / 2, 505)

  ctx.fillStyle = C.text
  ctx.font = `300 112px ${font}`
  ctx.fillText(rank === 1 ? 'Winner' : `${ordinal(rank)} place`, W / 2, 625)

  ctx.fillStyle = C.muted
  ctx.font = `400 34px ${font}`
  ctx.fillText(`${me.total.toLocaleString()} points  ·  ${totalPlayers} players`, W / 2, 685)

  // Awards won by this player
  const mine = awards.filter((a) => a.player_id === me.player_id).slice(0, 3)
  if (mine.length) {
    ctx.font = `500 28px ${font}`
    const chips = mine.map((a) => a.title)
    const gap = 16
    const widths = chips.map((c) => ctx.measureText(c).width + 56)
    let x = (W - (widths.reduce((s, w) => s + w, 0) + gap * (chips.length - 1))) / 2
    chips.forEach((c, i) => {
      roundRect(ctx, x, 718, widths[i], 60, 30)
      ctx.fillStyle = C.panel
      ctx.fill()
      ctx.fillStyle = C.soft
      ctx.textAlign = 'center'
      ctx.fillText(c, x + widths[i] / 2, 758)
      x += widths[i] + gap
    })
  }

  // Top three podium
  const top = [...scores].sort((a, b) => b.total - a.total).slice(0, 3)
  const slots = [
    { e: top[1], place: 2, h: 120, color: C.silver, text: C.soft },
    { e: top[0], place: 1, h: 170, color: C.gold, text: C.bg },
    { e: top[2], place: 3, h: 85, color: C.bronze, text: C.muted },
  ]
  const colW = 230
  const colGap = 30
  const startX = (W - (colW * 3 + colGap * 2)) / 2
  const base = 1200
  for (let i = 0; i < slots.length; i++) {
    const { e, place, h, color, text } = slots[i]
    if (!e) continue
    const x = startX + i * (colW + colGap)
    const top = base - h
    const av = 96
    await drawAvatar(ctx, e.avatar, x + (colW - av) / 2, top - av - 82, av, font)
    ctx.textAlign = 'center'
    ctx.fillStyle = e.player_id === me.player_id ? C.text : C.muted
    ctx.font = `500 28px ${font}`
    ctx.fillText(fitText(ctx, e.name, colW - 10), x + colW / 2, top - 44)
    ctx.fillStyle = C.faint
    ctx.font = `400 24px ${font}`
    ctx.fillText(e.total.toLocaleString(), x + colW / 2, top - 14)
    roundRect(ctx, x, top, colW, h + 20, 18)
    ctx.fillStyle = color
    ctx.fill()
    ctx.fillStyle = text
    ctx.font = `300 34px ${font}`
    ctx.fillText(ordinal(place), x + colW / 2, top + 48)
  }

  // Footer (covers the bottom of the podium blocks)
  ctx.fillStyle = C.bg
  ctx.fillRect(0, base, W, H - base)
  ctx.fillStyle = C.faint
  ctx.font = `400 26px ${font}`
  ctx.textAlign = 'center'
  ctx.fillText('Kwani me hudoo.', W / 2, H - 70)

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
