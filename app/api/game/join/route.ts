import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/db/supabase'
import { getGameByCode } from '@/lib/db/queries'
import { encodeSession, getSession, sessionCookieOptions } from '@/lib/auth/session'
import { isValidAvatar } from '@/lib/avatar'
import { decideSeat } from '@/lib/presence'
import { logEvent } from '@/lib/game/stateMachine'
import type { Player } from '@/types'

function joined(gameId: string, playerId: string) {
  const res = NextResponse.json({ success: true, gameId, playerId })
  const opts = sessionCookieOptions()
  res.cookies.set(opts.name, encodeSession({ playerId, gameId, isGameMaster: false }), opts)
  return res
}

/**
 * Joining never creates a duplicate of the same person:
 * 1. Same phone (session cookie for this game): you get your own seat back.
 * 2. Same name as a player who has gone quiet: you take that seat back,
 *    score included. This also lets people rejoin a game in progress.
 * 3. Same name as a player who is still active: asked to pick another name.
 * 4. Otherwise a new seat, only while the game is in the lobby.
 */
export async function POST(req: NextRequest) {
  const { gameCode, playerName, avatar } = await req.json()
  const name = String(playerName ?? '').trim().slice(0, 24)

  if (!gameCode || !name) {
    return NextResponse.json({ error: 'Game code and name required.' }, { status: 400 })
  }

  const game = await getGameByCode(gameCode)
  if (!game) {
    return NextResponse.json({ error: 'Game not found.' }, { status: 404 })
  }
  if (game.status === 'finished') {
    return NextResponse.json({ error: 'This game has finished. Ask the host for the new code.' }, { status: 400 })
  }

  const db = createServerSupabase()
  const now = new Date().toISOString()
  const look = isValidAvatar(avatar) ? avatar : undefined

  const { data } = await db.from('players').select('*').eq('game_id', game.id).eq('is_game_master', false)
  const players = (data ?? []) as Player[]

  const session = await getSession()
  const mineId = session && !session.isGameMaster && session.gameId === game.id ? session.playerId : null
  const seat = decideSeat(players, name, mineId)

  if (seat.kind === 'taken') {
    return NextResponse.json(
      { error: `Someone called ${seat.name} is already playing. Add an initial or a nickname.` },
      { status: 409 },
    )
  }

  if (seat.kind === 'reclaim') {
    await db
      .from('players')
      .update({ name, ...(look ? { avatar: look } : {}), is_connected: true, last_seen_at: now })
      .eq('id', seat.playerId)
    await logEvent(game.id, null, 'player_rejoined', { player_id: seat.playerId })
    return joined(game.id, seat.playerId)
  }

  // 4. New seat.
  if (game.status !== 'waiting') {
    return NextResponse.json(
      { error: 'This game has already started. To rejoin, use the exact name you played with.' },
      { status: 400 },
    )
  }
  if (players.length >= game.max_players) {
    return NextResponse.json({ error: 'Game is full.' }, { status: 400 })
  }

  const { data: player, error } = await db
    .from('players')
    .insert({
      game_id: game.id,
      name,
      avatar: look ?? 'ninja',
      is_game_master: false,
      is_connected: true,
      last_seen_at: now,
      score: 0,
      status: 'waiting',
    })
    .select()
    .single()

  if (error || !player) {
    return NextResponse.json({ error: 'Could not join game.' }, { status: 500 })
  }
  return joined(game.id, player.id)
}
