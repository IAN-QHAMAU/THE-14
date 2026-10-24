import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServerSupabase } from '@/lib/db/supabase'
import { getGameById } from '@/lib/db/queries'
import { isTeamId } from '@/lib/game/teams'

/** Team Battle: a player picks (or switches) their side. */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.isGameMaster) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
  const { team } = await req.json()
  if (!isTeamId(team)) return NextResponse.json({ error: 'Pick a team.' }, { status: 400 })

  const game = await getGameById(session.gameId)
  if (!game?.settings?.teams) return NextResponse.json({ error: 'Teams are not on in this game.' }, { status: 400 })

  await createServerSupabase()
    .from('events')
    .insert({ game_id: session.gameId, event_type: 'team_pick', actor_id: session.playerId, payload: { team } })
  return NextResponse.json({ success: true })
}
