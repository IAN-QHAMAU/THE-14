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
