import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServerSupabase } from '@/lib/db/supabase'
import { getCurrentRound, getEventsOfTypes, getGameById, getMyActions } from '@/lib/db/queries'
import { FREEZE_MS, powerState } from '@/lib/game/powers'
import { getQuestionById, OPTION_TYPES } from '@/lib/game/questions'
import { TOO_FAST_MS, maxWager, normalizeText, tidyAnswer, type AnswerPayload } from '@/lib/game/scoring'
import type { ActionType } from '@/types'

/** Small allowance for network lag after the timer hits zero. */
const LATE_GRACE_MS = 1500

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.isGameMaster) return fail('Unauthorized.', 403)

  const body = await req.json()
  const { playerId, gameId } = session

  const round = await getCurrentRound(gameId)
  if (!round || !['active', 'voting'].includes(round.status)) return fail('No active question.')

  const question = getQuestionById(round.question_id)
  if (!question) return fail('Question not found.')

  // All timing is measured on the server so it cannot be faked.
  const now = Date.now()
  const startsAt = round.starts_at ? Date.parse(round.starts_at) : now
  const endsAt = round.ends_at ? Date.parse(round.ends_at) : now + 60_000
  if (now < startsAt - 250) return fail('Not yet. Wait for it.')
  if (now > endsAt + LATE_GRACE_MS) return fail('Time is up.')

  // Power-ups: a frozen player has to wait out the freeze.
  const game = await getGameById(gameId)
  if (game?.settings?.powerUps && now < startsAt + FREEZE_MS) {
    const { effects } = powerState(await getEventsOfTypes(gameId, ['power_earned', 'power_played']))
    if (effects[round.round_number]?.frozen.includes(playerId)) return fail('Frozen. Hold on a moment.')
  }

  const timeTakenMs = Math.max(0, now - startsAt)
  const payload: AnswerPayload = { answered_at: new Date(now).toISOString(), time_taken_ms: timeTakenMs }
  let actionType: ActionType = 'answer'
  const data = round.data ?? {}

  const spot = data.sync?.id
  if (data.phase === 'wager') {
    // Final Wager: bet before seeing the question.
    const { data: me } = await createServerSupabase().from('players').select('score').eq('id', playerId).single()
    const value = Math.round(Number(body.value))
    if (!Number.isFinite(value)) return fail('Pick an amount.')
    actionType = 'wager'
    payload.value = Math.min(maxWager(me?.score ?? 0), Math.max(0, value))
  } else if (data.phase === 'pick' && playerId !== spot) {
    return fail('Hold on. Your turn is next.')
  } else if (data.phase === 'pick' && typeof body.text === 'string') {
    // Sync: the player who goes first can write their own answer.
    const text = tidyAnswer(body.text.slice(0, 40))
    if (!text) return fail('Write something first.')
    actionType = 'pick'
    payload.text = text
  } else if (question.type === 'sync' && data.phase === 'vote' && playerId === spot) {
    return fail('Sit back. They are guessing about you.')
  } else if (question.type === 'bluff' && round.status === 'active') {
    const text = String(body.text ?? '').trim().slice(0, 60)
    if (!text) return fail('Write something first.')
    if (normalizeText(text) === normalizeText(question.answer)) {
      return fail('That is the real answer. Write a fake one.')
    }
    actionType = 'bluff'
    payload.text = text
  } else if (question.type === 'closest') {
    const value = Number(body.value)
    if (!Number.isFinite(value)) return fail('Enter a number.')
    payload.value = Math.min(question.max, Math.max(question.min, value))
  } else if (question.type === 'order') {
    const order = Array.isArray(body.order) ? body.order.map(Number) : []
    const n = question.items.length
    const valid = order.length === n && new Set(order).size === n && order.every((i: number) => i >= 0 && i < n)
    if (!valid) return fail('Place every item first.')
    payload.order = order
  } else {
    const options =
      question.type === 'mostlikely' ? data.players ?? []
      : question.type === 'bluff' ? data.options ?? []
      : question.type === 'sync' && data.phase === 'vote' ? data.options ?? question.options
      : 'options' in question ? question.options : []
    const idx = Number(body.optionIndex)
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) return fail('Invalid answer.')

    if (question.type === 'bluff') {
      const mine = await getMyActions(round.id, playerId)
      const myText = mine.bluff?.text
      if (myText && normalizeText(myText) === normalizeText(data.options?.[idx] ?? '')) {
        return fail('You cannot vote for your own answer.')
      }
    }
    payload.option_index = idx
    if (data.phase === 'pick') actionType = 'pick'
  }

  payload.too_fast = actionType === 'answer' && OPTION_TYPES.includes(question.type) && timeTakenMs < TOO_FAST_MS

  const row = { round_id: round.id, player_id: playerId, action_type: actionType, payload }
  const actions = createServerSupabase().from('actions')
  // A bet can be changed until the betting time runs out; everything else is final.
  const { error } =
    actionType === 'wager'
      ? await actions.upsert(row, { onConflict: 'round_id,player_id,action_type' })
      : await actions.insert(row)

  if (error) {
    if (error.code === '23505') return fail('Already answered.')
    return fail('Could not submit answer.', 500)
  }

  return NextResponse.json({ success: true, tooFast: payload.too_fast, timeTakenMs })
}
