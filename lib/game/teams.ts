import type { PlayerScoreEntry } from '@/types'

export type TeamId = 'amber' | 'teal'

export const TEAMS: Record<TeamId, { label: string; colour: string }> = {
  amber: { label: 'Team Amber', colour: '#F2A541' },
  teal: { label: 'Team Teal', colour: '#3CC6B0' },
}

export const TEAM_IDS = Object.keys(TEAMS) as TeamId[]

export function isTeamId(v: unknown): v is TeamId {
  return v === 'amber' || v === 'teal'
}

/** Icons a captain can pick for their team. */
export const TEAM_ICONS = ['🔥', '🌊', '🦁', '🐺', '🦅', '🐉', '🦈', '🐍', '⚡', '👑', '💀', '🚀', '🌙', '🍀', '🎯', '🦍'] as const
export const TEAM_NAME_MAX = 18
const DEFAULT_ICON: Record<TeamId, string> = { amber: '🔥', teal: '🌊' }

/** A team's look: its name, its icon, its colour and who leads it. */
export interface TeamMeta {
  name: string
  icon: string
  colour: string
  captainId: string | null
}

type TeamEvent = { event_type?: string; actor_id: string | null; payload: Record<string, unknown>; created_at?: string }

/**
 * The captain is whoever has been on the team the longest: the first player
 * to pick that side and stay on it. If they switch away, the next one leads.
 */
export function teamCaptains(events: TeamEvent[], present?: Set<string>): Record<TeamId, string | null> {
  const joinedAt: Record<string, { team: TeamId; i: number }> = {}
  events.forEach((e, i) => {
    const team = e.payload?.team
    if (e.event_type && e.event_type !== 'team_pick') return
    if (!e.actor_id || !isTeamId(team)) return
    if (present && !present.has(e.actor_id)) return
    // Picking the side you are already on does not reset your place.
    if (joinedAt[e.actor_id]?.team !== team) joinedAt[e.actor_id] = { team, i }
  })
  const out: Record<TeamId, string | null> = { amber: null, teal: null }
  for (const id of TEAM_IDS) {
    const first = Object.entries(joinedAt)
      .filter(([, v]) => v.team === id)
      .sort((a, b) => a[1].i - b[1].i)[0]
    out[id] = first?.[0] ?? null
  }
  return out
}

/** Names and icons set by the captains, with the defaults filled in. */
export function teamMeta(events: TeamEvent[], present?: Set<string>): Record<TeamId, TeamMeta> {
  const captains = teamCaptains(events, present)
  const out = Object.fromEntries(
    TEAM_IDS.map((id) => [id, { name: TEAMS[id].label, icon: DEFAULT_ICON[id], colour: TEAMS[id].colour, captainId: captains[id] }]),
  ) as Record<TeamId, TeamMeta>
  for (const e of events) {
    if (e.event_type !== 'team_style' || !isTeamId(e.payload?.team)) continue
    const m = out[e.payload.team as TeamId]
    if (typeof e.payload.name === 'string' && e.payload.name) m.name = e.payload.name
    if (typeof e.payload.icon === 'string' && (TEAM_ICONS as readonly string[]).includes(e.payload.icon)) m.icon = e.payload.icon
  }
  return out
}

/** Default team looks, for screens that have nothing else yet. */
export const DEFAULT_TEAM_META = teamMeta([])

/** Tidies a team name typed by a captain. */
export function tidyTeamName(raw: unknown) {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, TEAM_NAME_MAX)
}

/** The latest pick per player wins, so players can switch sides in the lobby. */
export function teamsFromEvents(events: { actor_id: string | null; payload: Record<string, unknown> }[]) {
  const teams: Record<string, TeamId> = {}
  for (const e of events) {
    const team = e.payload?.team
    if (e.actor_id && isTeamId(team)) teams[e.actor_id] = team
  }
  return teams
}

export interface TeamScore {
  id: TeamId
  members: number
  total: number
  /** Teams are ranked by average points per player, so a smaller team is not punished. */
  average: number
}

export function teamScores(scores: PlayerScoreEntry[], teams: Record<string, TeamId>): TeamScore[] {
  return TEAM_IDS.map((id) => {
    const members = scores.filter((s) => teams[s.player_id] === id)
    const total = members.reduce((sum, s) => sum + s.total, 0)
    return { id, members: members.length, total, average: members.length ? Math.round(total / members.length) : 0 }
  }).sort((a, b) => b.average - a.average)
}

/** The side with fewer players, for anyone who has not picked. */
export function smallerTeam(teams: Record<string, TeamId>, playerIds: string[]): TeamId {
  const count = (t: TeamId) => playerIds.filter((id) => teams[id] === t).length
  return count('amber') <= count('teal') ? 'amber' : 'teal'
}

/** Both teams with their players, the winner first, for the result card. */
export function battleOf(scores: PlayerScoreEntry[], teams: Record<string, TeamId>, meta: Record<TeamId, TeamMeta>) {
  const [a, b] = teamScores(scores, teams).map((t) => ({
    name: meta[t.id].name,
    icon: meta[t.id].icon,
    colour: meta[t.id].colour,
    average: t.average,
    members: scores.filter((s) => teams[s.player_id] === t.id),
  }))
  return [a, b] as [typeof a, typeof a]
}
