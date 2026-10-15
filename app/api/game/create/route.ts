import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/db/supabase'
import { encodeSession, getSession, sessionCookieOptions } from '@/lib/auth/session'
import { getGameById } from '@/lib/db/queries'
import { finishGame } from '@/lib/game/stateMachine'
import type { Game } from '@/types'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Wrap up the host's previous game so nobody is left stuck in it.
 * A game in progress ends with its podium. A lobby that never started is
 * closed, and its players are told to join the new game.
 */
async function closePreviousGame(gameId: string) {
  const game = await getGameById(gameId)
  if (!game || game.status === 'finished') return
  if (game.status === 'waiting') {
    await createServerSupabase()
      .from('games')
      .update({ status: 'finished', total_questions: 0, ended_at: new Date().toISOString() })
      .eq('id', gameId)
      .eq('status', 'waiting')
    return
  }
  await finishGame(gameId)
}

export async function POST() {
  const db = createServerSupabase()

  const previous = await getSession()
  if (previous?.isGameMaster) await closePreviousGame(previous.gameId)

  // Codes are random; retry on the rare clash with an existing game.
  let game: Game | null = null
  for (let attempt = 0; attempt < 5 && !game; attempt++) {
    const { data } = await db
      .from('games')
      .insert({
        game_code: generateCode(),
        status: 'waiting',
        current_round: 1,
        max_players: 14,
        category: null,
        total_questions: 0,
      })
      .select()
      .single()
    game = data
  }

  if (!game) {
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

  const res = NextResponse.json({ success: true, gameId: game.id, gameCode: game.game_code })
  res.cookies.set(opts.name, encoded, opts)
  return res
}
