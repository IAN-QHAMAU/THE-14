'use client'

import { useEffect, useState } from 'react'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { TEAM_ICONS, TEAM_IDS, TEAM_NAME_MAX, teamScores, type TeamId, type TeamMeta } from '@/lib/game/teams'
import { cn } from '@/lib/utils'
import type { Player, PlayerScoreEntry } from '@/types'

type Metas = Record<TeamId, TeamMeta>

/** A team's badge: its icon on a tile in the team colour. */
export function TeamCrest({ meta, size = 'md', className }: { meta: TeamMeta; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const dims = { sm: 'w-8 h-8 text-base rounded-xl', md: 'w-12 h-12 text-2xl rounded-2xl', lg: 'w-16 h-16 text-3xl rounded-[1.25rem]', xl: 'w-28 h-28 text-6xl rounded-[2rem]' }[size]
  return (
    <span
      className={cn('inline-flex items-center justify-center flex-shrink-0 leading-none', dims, className)}
      style={{
        background: `linear-gradient(145deg, ${meta.colour}, ${meta.colour}99)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 24px -10px ${meta.colour}`,
      }}
      aria-hidden
    >
      {meta.icon}
    </span>
  )
}

// ─── Lobby ─────────────────────────────────────────────────────────────────

/** Lobby: tap a side to join it. The captain names the team and picks its icon. */
export function TeamPicker({ players, teams, meta, myId }: { players: Player[]; teams: Record<string, TeamId>; meta: Metas; myId?: string }) {
  const [busy, setBusy] = useState<TeamId | null>(null)
  const [error, setError] = useState('')
  const mine = myId ? teams[myId] : undefined

  async function post(body: Record<string, unknown>) {
    setError('')
    try {
      const res = await fetch('/api/game/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        setError((await res.json()).error ?? 'Something went wrong.')
        return false
      }
      return true
    } catch {
      setError('Connection problem. Try again.')
      return false
    }
  }

  async function pick(team: TeamId) {
    if (busy || team === mine) return
    setBusy(team)
    await post({ team })
    setBusy(null)
  }

  return (
    <section className="space-y-3 animate-fade-up">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs text-stone-400 tracking-widest uppercase">Pick your side</h2>
        {!mine && <span className="text-xs text-stone-400">Or you join the smaller team</span>}
      </div>
      <div className="space-y-3">
        {TEAM_IDS.map((id) => {
          const m = meta[id]
          const members = players.filter((p) => !p.is_game_master && teams[p.id] === id)
          const captain = members.find((p) => p.id === m.captainId)
          const on = mine === id
          const amCaptain = on && m.captainId === myId
          return (
            <div
              key={id}
              className={cn('rounded-3xl border-2 p-4 transition-all', on ? 'shadow-lg' : 'border-stone-200 bg-white')}
              style={on ? { borderColor: m.colour, background: `linear-gradient(160deg, ${m.colour}24, #ffffff 70%)` } : undefined}
            >
              <div className="flex items-center gap-3">
                <TeamCrest meta={m} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-medium text-stone-900 truncate">{m.name}</p>
                  <p className="text-xs text-stone-500">
                    {members.length} {members.length === 1 ? 'player' : 'players'}
                    {captain ? ` · 👑 ${captain.id === myId ? 'You lead' : `${captain.name} leads`}` : ''}
                  </p>
                </div>
                {!on && (
                  <button
                    type="button"
                    onClick={() => pick(id)}
                    disabled={busy !== null}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-stone-900 active:scale-95 transition-transform disabled:opacity-50"
                    style={{ backgroundColor: m.colour }}
                  >
                    {mine ? 'Switch' : 'Join'}
                  </button>
                )}
              </div>

              {members.length > 0 && (
                <ul className="mt-4 grid grid-cols-4 gap-x-2 gap-y-3">
                  {members.map((p) => (
                    <li key={p.id} className="flex flex-col items-center gap-1 min-w-0 animate-seat-in">
                      <span className="relative">
                        <AvatarDisplay avatarId={p.avatar} size="md" idle />
                        {p.id === m.captainId && <span className="absolute -top-2 -right-1 text-sm drop-shadow">👑</span>}
                      </span>
                      <span className={cn('text-[11px] truncate max-w-full', p.id === myId ? 'text-stone-900 font-medium' : 'text-stone-500')}>{p.name}</span>
                    </li>
                  ))}
                </ul>
              )}

              {amCaptain && <CaptainTools meta={m} teammates={members.filter((p) => p.id !== myId)} onSave={post} />}
            </div>
          )
        })}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </section>
  )
}

/** The captain's controls: rename the team, pick its icon, or hand over the badge. */
function CaptainTools({
  meta,
  teammates,
  onSave,
}: {
  meta: TeamMeta
  teammates: Player[]
  onSave: (body: Record<string, unknown>) => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(meta.name)
  const [saving, setSaving] = useState(false)
  // The teammate picked to take the badge, waiting for a second tap to confirm.
  const [handTo, setHandTo] = useState<string | null>(null)

  async function handOver(id: string) {
    if (handTo !== id) {
      setHandTo(id)
      return
    }
    setSaving(true)
    await onSave({ captain: id })
    setSaving(false)
    setHandTo(null)
  }

  useEffect(() => {
    if (!open) setName(meta.name)
  }, [meta.name, open])

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.trim() === meta.name) return
    setSaving(true)
    if (await onSave({ style: { name } })) setOpen(false)
    setSaving(false)
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-4 w-full rounded-xl border border-dashed border-stone-300 py-2.5 text-sm text-stone-600 hover:border-stone-400">
        👑 You are captain. Name the team, pick an icon or pass the badge
      </button>
    )
  }

  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-white/80 border border-stone-200 p-3 animate-fade-up">
      <form onSubmit={saveName} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={TEAM_NAME_MAX}
          placeholder="Team name"
          autoComplete="off"
          className="flex-1 min-w-0 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-base text-stone-900 outline-none focus:border-stone-400"
        />
        <button type="submit" disabled={saving || !name.trim() || name.trim() === meta.name} className="rounded-xl bg-stone-900 text-stone-50 px-4 text-sm font-medium disabled:opacity-40">
          Save
        </button>
      </form>
      <div className="grid grid-cols-8 gap-1.5">
        {TEAM_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => void onSave({ style: { icon } })}
            aria-pressed={icon === meta.icon}
            className={cn('aspect-square rounded-xl text-xl flex items-center justify-center transition-all', icon === meta.icon ? 'scale-110 shadow-md' : 'bg-stone-100 hover:bg-stone-200')}
            style={icon === meta.icon ? { backgroundColor: meta.colour } : undefined}
          >
            {icon}
          </button>
        ))}
      </div>
      {teammates.length > 0 && (
        <div className="space-y-2 border-t border-stone-200 pt-3">
          <p className="text-xs text-stone-500">Hand the 👑 to a teammate</p>
          <div className="flex flex-wrap gap-2">
            {teammates.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={saving}
                onClick={() => void handOver(p.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs transition-colors',
                  handTo === p.id ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400',
                )}
              >
                <AvatarDisplay avatarId={p.avatar} size="xs" />
                {handTo === p.id ? `Tap again to make ${p.name} captain` : p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen(false)} className="w-full text-xs text-stone-500 py-1">
        Done
      </button>
    </div>
  )
}

// ─── Standings ─────────────────────────────────────────────────────────────

/**
 * Team Battle standings: the teams race, and each team card shows its players
 * with what they have added, best first.
 */
export function TeamStandings({
  scores,
  teams,
  meta,
  myId,
  size = 'phone',
  subtitle,
}: {
  scores: PlayerScoreEntry[]
  teams: Record<string, TeamId>
  meta: Metas
  myId?: string
  size?: 'phone' | 'stage'
  subtitle?: string
}) {
  const rows = teamScores(scores, teams)
  const stage = size === 'stage'
  const top = Math.max(1, ...rows.map((r) => r.average))
  const gap = rows[0].average - rows[1].average

  return (
    <div className="w-full space-y-5">
      <header className="text-center space-y-1 animate-fade-up">
        <h1 className={cn('font-light text-stone-50', stage ? 'text-5xl' : 'text-3xl')}>Team standings</h1>
        <p className={cn('text-stone-400', stage ? 'text-lg' : 'text-sm')}>
          {gap === 0 ? 'Dead level.' : `${meta[rows[0].id].name} lead by ${gap.toLocaleString()} a player.`}
          {subtitle ? ` ${subtitle}` : ''}
        </p>
      </header>

      <ol className={cn('grid gap-4', stage && 'md:grid-cols-2')}>
        {rows.map((r, i) => {
          const m = meta[r.id]
          const members = scores.filter((s) => teams[s.player_id] === r.id).sort((a, b) => b.total - a.total)
          const lead = i === 0 && gap > 0
          return (
            <li
              key={r.id}
              className="relative overflow-hidden rounded-3xl border p-5 animate-fade-up"
              style={{
                animationDelay: `${i * 150}ms`,
                borderColor: lead ? `${m.colour}88` : '#44403c',
                background: `radial-gradient(120% 90% at 0% 0%, ${m.colour}${lead ? '33' : '1a'}, transparent 60%), #1c1917`,
              }}
            >
              <div className="flex items-center gap-4">
                <span className="relative">
                  <TeamCrest meta={m} size={stage ? 'lg' : 'md'} />
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-stone-900 border border-stone-700 text-[11px] text-stone-300 flex items-center justify-center">{i + 1}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-medium text-stone-50 leading-tight break-words', stage ? 'text-2xl' : 'text-lg')}>{m.name}</p>
                  <p className="text-xs text-stone-400">
                    {r.members} {r.members === 1 ? 'player' : 'players'} · {r.total.toLocaleString()} total
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn('font-light tabular-nums text-stone-50', stage ? 'text-5xl' : 'text-2xl')}>{r.average.toLocaleString()}</p>
                  <p className="text-[10px] tracking-widest uppercase text-stone-500">avg</p>
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full rounded-full origin-left animate-grow-x" style={{ width: `${(r.average / top) * 100}%`, backgroundColor: m.colour }} />
              </div>

              <ul className={cn('mt-4 grid gap-2', stage ? 'grid-cols-4' : 'grid-cols-4')}>
                {members.map((s, j) => (
                  <li key={s.player_id} className="flex flex-col items-center gap-1 min-w-0">
                    <span className="relative">
                      <AvatarDisplay avatarId={s.avatar} size={stage ? 'lg' : 'md'} mood={j === 0 && s.total > 0 ? 'happy' : null} />
                      {j === 0 && s.total > 0 && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[9px] font-semibold tracking-wider text-stone-900" style={{ backgroundColor: m.colour }}>
                          MVP
                        </span>
                      )}
                    </span>
                    <span className={cn('text-[11px] truncate max-w-full', s.player_id === myId ? 'text-stone-50 font-medium' : 'text-stone-400')}>{s.name}</span>
                    <span className="text-[11px] font-mono tabular-nums text-stone-500">{s.total.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─── Finale ────────────────────────────────────────────────────────────────

/** The end of a Team Battle: the winners take the stage. */
export function TeamFinale({
  scores,
  teams,
  meta,
  myId,
  size = 'phone',
}: {
  scores: PlayerScoreEntry[]
  teams: Record<string, TeamId>
  meta: Metas
  myId?: string
  size?: 'phone' | 'stage'
}) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 600), setTimeout(() => setStep(2), 2900), setTimeout(() => setStep(3), 3800)]
    return () => t.forEach(clearTimeout)
  }, [])

  const rows = teamScores(scores, teams)
  const [first, second] = rows
  const tie = first.average === second.average
  const w = meta[first.id]
  const l = meta[second.id]
  const stage = size === 'stage'
  const winners = scores.filter((s) => teams[s.player_id] === first.id).sort((a, b) => b.total - a.total)
  const losers = scores.filter((s) => teams[s.player_id] === second.id).sort((a, b) => b.total - a.total)
  const myTeam = myId ? teams[myId] : undefined
  const share = first.average + second.average ? (first.average / (first.average + second.average)) * 100 : 50

  return (
    <div className="w-full space-y-8 text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-stone-500 animate-fade-up">Team Battle · Final</p>

      {/* The battle bar fills, then the winner is called. */}
      <div className={cn('mx-auto space-y-2 transition-opacity duration-500', stage ? 'max-w-2xl' : 'max-w-sm', step >= 1 ? 'opacity-100' : 'opacity-0')}>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-2 text-stone-200"><TeamCrest meta={w} size="sm" />{w.name}</span>
          <span className="flex items-center gap-2 text-stone-200">{l.name}<TeamCrest meta={l} size="sm" /></span>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden bg-stone-800 flex">
          <div className="h-full transition-all duration-[2000ms] ease-out" style={{ width: step >= 1 ? `${share}%` : '50%', backgroundColor: w.colour }} />
          <div className="h-full flex-1" style={{ backgroundColor: l.colour }} />
          <div className="absolute inset-y-0 left-1/2 w-px bg-stone-900/60" />
        </div>
        <div className="flex justify-between font-mono text-xs tabular-nums text-stone-400">
          <span>{first.average.toLocaleString()} avg</span>
          <span>{second.average.toLocaleString()} avg</span>
        </div>
      </div>

      {step >= 2 && (
        <div className="relative flex flex-col items-center gap-4 animate-fade-up">
          {/* A slow halo in the winning colour behind the crest. */}
          <div
            aria-hidden
            className={cn('absolute -top-10 rounded-full blur-2xl opacity-70', stage ? 'w-96 h-96' : 'w-64 h-64')}
            style={{ background: `radial-gradient(closest-side, ${tie ? '#a8a29e' : w.colour}66, transparent)` }}
          />
          <div
            aria-hidden
            className={cn('absolute rounded-full border border-dashed animate-[spin_18s_linear_infinite]', stage ? '-top-4 w-56 h-56' : '-top-3 w-40 h-40')}
            style={{ borderColor: `${tie ? '#a8a29e' : w.colour}55` }}
          />
          {tie ? (
            <div className="relative flex gap-3">
              <TeamCrest meta={w} size="xl" />
              <TeamCrest meta={l} size="xl" />
            </div>
          ) : (
            <TeamCrest meta={w} size="xl" className="relative" />
          )}
          <div className="relative space-y-1">
            <p className="text-xs tracking-[0.35em] uppercase" style={{ color: tie ? '#d6d3d1' : w.colour }}>{tie ? 'Dead heat' : 'Champions'}</p>
            <h2 className={cn('font-semibold tracking-tight leading-none', stage ? 'text-7xl' : 'text-5xl')} style={{ color: tie ? '#fafaf9' : w.colour }}>
              {tie ? 'Nobody blinked' : w.name}
            </h2>
            {!tie && myTeam && (
              <p className="pt-2 text-sm text-stone-300">{myTeam === first.id ? 'Your team won. Enjoy it.' : `${l.name} gave it everything. Next time.`}</p>
            )}
          </div>
        </div>
      )}

      {step >= 3 && (
        <div className={cn('mx-auto space-y-6 animate-fade-up', stage ? 'max-w-3xl' : 'max-w-md')}>
          <Lineup members={winners} meta={w} myId={myId} stage={stage} win={!tie} />
          <Lineup members={losers} meta={l} myId={myId} stage={stage} win={false} quiet={!tie} />
        </div>
      )}
    </div>
  )
}

function Lineup({ members, meta, myId, stage, win, quiet = false }: { members: PlayerScoreEntry[]; meta: TeamMeta; myId?: string; stage: boolean; win: boolean; quiet?: boolean }) {
  return (
    <div className={cn('rounded-3xl p-4 border', quiet ? 'border-stone-800 bg-stone-900/40' : 'bg-stone-800/50')} style={quiet ? undefined : { borderColor: `${meta.colour}55` }}>
      <p className="flex items-center justify-center gap-2 text-xs tracking-widest uppercase text-stone-500 mb-3">
        {meta.icon} {meta.name}
      </p>
      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-3">
        {members.map((s, i) => (
          <li key={s.player_id} className={cn('flex flex-col items-center gap-1', stage ? 'w-24' : 'w-16')}>
            <span className={cn('relative', win && 'motion-safe:animate-avatar-hop')} style={win ? { animationDelay: `${i * 120}ms` } : undefined}>
              <AvatarDisplay avatarId={s.avatar} size={win ? (stage ? 'xl' : 'lg') : stage ? 'lg' : 'md'} mood={win ? 'happy' : quiet ? 'sad' : null} />
              {i === 0 && s.total > 0 && <span className="absolute -top-2 -right-1 text-base drop-shadow">⭐</span>}
            </span>
            <span className={cn('text-xs truncate max-w-full', s.player_id === myId ? 'text-stone-50 font-medium' : 'text-stone-300')}>{s.name}</span>
            <span className="text-[11px] font-mono tabular-nums text-stone-500">{s.total.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A small coloured dot for a player's team. */
export function TeamDot({ team, meta }: { team?: TeamId; meta: Metas }) {
  if (!team) return null
  return <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta[team].colour }} aria-label={meta[team].name} />
}
