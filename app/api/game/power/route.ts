import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServerSupabase } from '@/lib/db/supabase'
import { getEventsOfTypes, getGameById } from '@/lib/db/queries'
import { POWER_CARDS, STEAL_POINTS, powerState } from '@/lib/game/powers'

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

/** Power-ups: play the card you are holding, between questions. */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.isGameMaster) return fail('Unauthorized.', 403)
  const { targetId } = await req.json()
  const { gameId, playerId } = session

  const game = await getGameById(gameId)
  if (!game?.settings?.powerUps) return fail('Power-ups are not on in this game.')
  if (!['category', 'question_result', 'leaderboard'].includes(game.status)) return fail('Play cards between questions.')

  const db = createServerSupabase()
  const events = await getEventsOfTypes(gameId, ['power_earned', 'power_played'])
  const { held } = powerState(events)
  const card = held[playerId]
  if (!card) return fail('You have no card to play.')
  if (card === 'shield') return fail('Your shield works by itself.')

  const { data: rows } = await db.from('players').select('id, name, score').eq('game_id', gameId).eq('is_game_master', false)
  const players = (rows ?? []) as { id: string; name: string; score: number }[]

  let target: { id: string; name: string; score: number } | undefined
  if (card === 'steal') {
    // From the player just above you, or from second place if you lead.
    const sorted = [...players].sort((a, b) => b.score - a.score)
    const i = sorted.findIndex((p) => p.id === playerId)
    target = i > 0 ? sorted[i - 1] : sorted[1]
    if (!target) return fail('Nobody to steal from yet.')
  } else if (POWER_CARDS[card].needsTarget) {
    target = players.find((p) => p.id === targetId && p.id !== playerId)
    if (!target) return fail('Pick another player.')
  }

  const forRound = game.current_round + 1
  // A shield held by the target blocks the card and is used up.
  if (target && held[target.id] === 'shield') {
    await db.from('events').insert({ game_id: gameId, event_type: 'power_played', actor_id: playerId, target_id: target.id, payload: { card, forRound, blockedBy: 'shield' } })
    return NextResponse.json({ success: true, blocked: true })
  }

  let amount = 0
  if (card === 'steal' && target) {
    const me = players.find((p) => p.id === playerId)!
    amount = Math.min(STEAL_POINTS, target.score)
    await db.from('players').update({ score: target.score - amount }).eq('id', target.id)
    await db.from('players').update({ score: me.score + amount }).eq('id', playerId)
  }

  await db.from('events').insert({
    game_id: gameId,
    event_type: 'power_played',
    actor_id: playerId,
    target_id: target?.id ?? null,
    payload: { card, forRound, amount },
  })
  return NextResponse.json({ success: true })
}
