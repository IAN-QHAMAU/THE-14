import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/db/supabase'
import { encodeSession, sessionCookieOptions } from '@/lib/auth/session'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST() {
  const db = createServerSupabase()

  const code = generateCode()
  const { data: game, error: gameError } = await db
    .from('games')
    .insert({
      game_code: code,
      status: 'waiting',
      current_round: 1,
      max_players: 14,
      category: null,
      total_questions: 0,
    })
    .select()
    .single()

  if (gameError || !game) {
    return NextResponse.json({ error: 'Could not create game.' }, { status: 500 })
  }

  const { data: gm, error: gmError } = await db
    .from('players')
    .insert({
      game_id: game.id,
      name: 'Game Master',
      avatar: 'wizard',
      is_game_master: true,
      is_connected: true,
      score: 0,
      status: 'ready',
    })
    .select()
    .single()

  if (gmError || !gm) {
    return NextResponse.json({ error: 'Could not create GM.' }, { status: 500 })
  }

  const session = { playerId: gm.id, gameId: game.id, isGameMaster: true }
  const encoded = encodeSession(session)
  const opts = sessionCookieOptions()

  const res = NextResponse.json({ success: true, gameId: game.id, gameCode: code })
  res.cookies.set(opts.name, encoded, opts)
  return res
}
