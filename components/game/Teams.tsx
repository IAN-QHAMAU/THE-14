'use client'

import { useState } from 'react'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { TEAMS, TEAM_IDS, teamScores, type TeamId } from '@/lib/game/teams'
import { cn } from '@/lib/utils'
import type { Player, PlayerScoreEntry } from '@/types'

/** Lobby: tap a side to join it. You can switch until the game starts. */
export function TeamPicker({ players, teams, myId }: { players: Player[]; teams: Record<string, TeamId>; myId?: string }) {
  const [busy, setBusy] = useState<TeamId | null>(null)
  const [error, setError] = useState('')
  const mine = myId ? teams[myId] : undefined

  async function pick(team: TeamId) {
    if (busy || team === mine) return
    setBusy(team)
    setError('')
    try {
      const res = await fetch('/api/game/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team }) })
      if (!res.ok) setError((await res.json()).error ?? 'Could not join that team.')
    } catch {
      setError('Connection problem. Try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="space-y-3 animate-fade-up">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs text-stone-400 tracking-widest uppercase">Pick your side</h2>
        {!mine && <span className="text-xs text-stone-400">Or you join the smaller team</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TEAM_IDS.map((id) => {
          const t = TEAMS[id]
          const members = players.filter((p) => !p.is_game_master && teams[p.id] === id)
          const on = mine === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => pick(id)}
              disabled={busy !== null}
              aria-pressed={on}
              className={cn('rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]', on ? 'shadow-md' : 'border-stone-200 bg-white')}
              style={on ? { borderColor: t.colour, backgroundColor: `${t.colour}1a` } : undefined}
            >
              <span className="flex items-center justify-between">
                <span className="text-base font-medium text-stone-900">{t.label}</span>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colour }} />
              </span>
              <span className="block mt-1 text-xs text-stone-500">
                {members.length} {members.length === 1 ? 'player' : 'players'}
                {on ? ' · you' : ''}
              </span>
              <span className="mt-3 flex -space-x-2 min-h-[2rem]">
                {members.slice(0, 6).map((p) => (
                  <AvatarDisplay key={p.id} avatarId={p.avatar} size="sm" className="ring-2 ring-white" />
                ))}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </section>
  )
}

/** Two bars racing each other, ranked by average points per player. */
export function TeamBar({ scores, teams, dark = true, size = 'phone' }: { scores: PlayerScoreEntry[]; teams: Record<string, TeamId>; dark?: boolean; size?: 'phone' | 'stage' }) {
  const rows = teamScores(scores, teams)
  if (!rows.some((r) => r.members)) return null
  const top = Math.max(1, ...rows.map((r) => r.average))
  const stage = size === 'stage'
  return (
    <div className={cn('rounded-2xl p-4 space-y-3 animate-fade-up', dark ? 'bg-stone-800/70' : 'bg-white border border-stone-200')}>
      {rows.map((r, i) => {
        const t = TEAMS[r.id]
        return (
          <div key={r.id} className="space-y-1.5">
            <div className={cn('flex items-baseline justify-between', stage ? 'text-lg' : 'text-sm')}>
              <span className={cn('flex items-center gap-2', dark ? 'text-stone-100' : 'text-stone-900')}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colour }} />
                {t.label}
                {i === 0 && r.average > 0 && rows[1].average !== r.average && <span className="text-xs" style={{ color: t.colour }}>leading</span>}
              </span>
              <span className={cn('font-mono tabular-nums', dark ? 'text-stone-300' : 'text-stone-600')}>
                {r.average.toLocaleString()} <span className="text-xs opacity-60">avg</span>
              </span>
            </div>
            <div className={cn('h-2.5 rounded-full overflow-hidden', dark ? 'bg-stone-700' : 'bg-stone-100')}>
              <div className="h-full rounded-full origin-left animate-grow-x" style={{ width: `${(r.average / top) * 100}%`, backgroundColor: t.colour }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Podium: which side won. */
export function TeamBanner({ scores, teams, size = 'phone' }: { scores: PlayerScoreEntry[]; teams: Record<string, TeamId>; size?: 'phone' | 'stage' }) {
  const rows = teamScores(scores, teams)
  if (!rows.some((r) => r.members)) return null
  const [first, second] = rows
  const tie = first.average === second.average
  const t = TEAMS[first.id]
  return (
    <div className="text-center space-y-1 animate-fade-up">
      <p className={cn('font-light', size === 'stage' ? 'text-4xl' : 'text-2xl')} style={{ color: tie ? undefined : t.colour }}>
        {tie ? 'The teams are tied' : `${t.label} wins`}
      </p>
      <p className="text-sm text-stone-400">
        {TEAMS[first.id].label} {first.average.toLocaleString()} avg · {TEAMS[second.id].label} {second.average.toLocaleString()} avg
      </p>
    </div>
  )
}

/** A small coloured dot for a player's team. */
export function TeamDot({ team }: { team?: TeamId }) {
  if (!team) return null
  return <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: TEAMS[team].colour }} aria-label={TEAMS[team].label} />
}
