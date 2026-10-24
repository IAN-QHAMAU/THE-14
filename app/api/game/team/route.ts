import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServerSupabase } from '@/lib/db/supabase'
import { getEventsOfTypes, getGameById, getPlayers } from '@/lib/db/queries'
import { TEAM_ICONS, isTeamId, teamCaptains, teamsFromEvents, tidyTeamName } from '@/lib/game/teams'

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

/**
 * Team Battle: a player picks (or switches) their side. A team's captain can
 * also rename the team and pick its icon, while the game is in the lobby.
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.isGameMaster) return fail('Unauthorized.', 403)
  const body = await req.json()

  const game = await getGameById(session.gameId)
  if (!game?.settings?.teams) return fail('Teams are not on in this game.')
  const db = createServerSupabase()

  if (body.style) {
    if (game.status !== 'waiting') return fail('Team names are set in the lobby.')
    const [events, players] = await Promise.all([getEventsOfTypes(session.gameId, ['team_pick']), getPlayers(session.gameId)])
    const team = teamsFromEvents(events)[session.playerId]
    const present = new Set(players.map((p) => p.id))
    if (!team || teamCaptains(events, present)[team] !== session.playerId) return fail('Only the team captain can do that.', 403)
    const payload: Record<string, string> = { team }
    if (body.style.name !== undefined) {
      const name = tidyTeamName(body.style.name)
      if (!name) return fail('Give your team a name.')
      payload.name = name
    }
    if (body.style.icon !== undefined) {
      if (!(TEAM_ICONS as readonly string[]).includes(body.style.icon)) return fail('Pick one of the icons.')
      payload.icon = body.style.icon
    }
    await db.from('events').insert({ game_id: session.gameId, event_type: 'team_style', actor_id: session.playerId, payload })
    return NextResponse.json({ success: true })
  }

  const { team } = body
  if (!isTeamId(team)) return fail('Pick a team.')
  await db.from('events').insert({ game_id: session.gameId, event_type: 'team_pick', actor_id: session.playerId, payload: { team } })
  return NextResponse.json({ success: true })
}
