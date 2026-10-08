import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/db/supabase'
import { getGameByCode } from '@/lib/db/queries'
import { encodeSession, sessionCookieOptions } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const { gameCode, playerName, avatar } = await req.json()

  if (!gameCode || !playerName?.trim()) {
    return NextResponse.json({ error: 'Game code and name required.' }, { status: 400 })
  }

  const game = await getGameByCode(gameCode)
  if (!game) {
    return NextResponse.json({ error: 'Game not found.' }, { status: 404 })
  }
  if (game.status !== 'waiting') {
    return NextResponse.json({ error: 'This game has already started.' }, { status: 400 })
  }

  const db = createServerSupabase()
  const { data: existing } = await db
    .from('players')
    .select('id')
    .eq('game_id', game.id)
    .eq('is_game_master', false)

  if ((existing?.length ?? 0) >= game.max_players) {
    return NextResponse.json({ error: 'Game is full.' }, { status: 400 })
  }

  const { data: player, error } = await db
    .from('players')
    .insert({
      game_id: game.id,
      name: playerName.trim().slice(0, 24),
      avatar: avatar ?? 'ninja',
      is_game_master: false,
      is_connected: true,
      score: 0,
      status: 'waiting',
    })
    .select()
    .single()

  if (error || !player) {
    return NextResponse.json({ error: 'Could not join game.' }, { status: 500 })
  }

  const session = { playerId: player.id, gameId: game.id, isGameMaster: false }
  const encoded = encodeSession(session)
  const opts = sessionCookieOptions()

  const res = NextResponse.json({ success: true, gameId: game.id, playerId: player.id })
  res.cookies.set(opts.name, encoded, opts)
  return res
}
