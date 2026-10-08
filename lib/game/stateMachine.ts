import { createServerSupabase } from '@/lib/db/supabase'
import { QUESTIONS, getQuestionsForCategory, type Category } from '@/lib/game/questions'
import type { GameStatus, RoundStatus } from '@/types'

const db = () => createServerSupabase()

// ─── Game transitions ──────────────────────────────────────────────────────

export async function setupGame(gameId: string, category: Category, questionCount: number) {
  const client = db()

  const questions = getQuestionsForCategory(category, questionCount)

  // Store selected questions as rounds
  await client.from('rounds').delete().eq('game_id', gameId)
  await client.from('rounds').insert(
    questions.map((q, i) => ({
      game_id: gameId,
      round_number: i + 1,
      title: `Question ${i + 1}`,
      description: q.question,
      question_id: q.id,
      status: 'pending' as RoundStatus,
    }))
  )

  await client
    .from('games')
    .update({
      status: 'category' as GameStatus,
      category,
      total_questions: questions.length,
      started_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  await logEvent(gameId, null, 'game_started', null, null, { category, questionCount })
}

export async function startNextQuestion(gameId: string) {
  const client = db()

  // Find next pending round
  const { data: rounds } = await client
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .eq('status', 'pending')
    .order('round_number')
    .limit(1)

  const round = rounds?.[0]
  if (!round) return null

  const now = new Date()
  const ends = new Date(now.getTime() + 20 * 1000) // 20 seconds per question

  await client
    .from('rounds')
    .update({
      status: 'active' as RoundStatus,
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
    })
    .eq('id', round.id)

  await client
    .from('games')
    .update({ status: 'active' as GameStatus, current_round: round.round_number })
    .eq('id', gameId)

  await logEvent(gameId, round.id, 'round_started', null, null, {
    question_id: round.question_id,
    round_number: round.round_number,
  })

  return round
}

export async function lockAndRevealQuestion(roundId: string, gameId: string) {
  const client = db()

  // Lock round
  await client.from('rounds').update({ status: 'locked' as RoundStatus }).eq('id', roundId)

  // Get round info
  const { data: round } = await client
    .from('rounds')
    .select('question_id, round_number')
    .eq('id', roundId)
    .single()

  if (!round) return

  // Get the question
  const allQuestions = Object.values(QUESTIONS).flat()
  const question = allQuestions.find((q) => q.id === round.question_id)
  if (!question) return

  // Get all answers
  const { data: actions } = await client
    .from('actions')
    .select('player_id, payload, created_at')
    .eq('round_id', roundId)

  const answers = actions ?? []
  const totalAnswers = answers.length

  // Tally stats
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
  for (const a of answers) {
    const p = a.payload as { option_index: number }
    counts[p.option_index] = (counts[p.option_index] ?? 0) + 1
  }

  const answerStats = [0, 1, 2, 3].map((idx) => ({
    optionIndex: idx,
    count: counts[idx] ?? 0,
    percentage: totalAnswers > 0 ? ((counts[idx] ?? 0) / totalAnswers) * 100 : 0,
  }))

  // Sort correct answers by speed for bonus
  const correctAnswers = answers
    .filter((a) => (a.payload as { option_index: number }).option_index === question.correct)
    .sort((a, b) => {
      const ta = (a.payload as { time_taken_ms: number }).time_taken_ms ?? 99999
      const tb = (b.payload as { time_taken_ms: number }).time_taken_ms ?? 99999
      return ta - tb
    })

  // Award points
  for (let i = 0; i < correctAnswers.length; i++) {
    const action = correctAnswers[i]
    let pts = question.points
    // Speed bonus: full bonus for 1st, half for 2nd, quarter for 3rd
    if (i === 0) pts += question.speedBonus
    else if (i === 1) pts += Math.floor(question.speedBonus / 2)
    else if (i === 2) pts += Math.floor(question.speedBonus / 4)

    await awardPoints(gameId, action.player_id, roundId, pts, `Correct answer Q${round.round_number}`)
  }

  // Mark round as revealing
  await client.from('rounds').update({ status: 'revealing' as RoundStatus }).eq('id', roundId)
  await client.from('games').update({ status: 'question_result' as GameStatus }).eq('id', gameId)

  await logEvent(gameId, roundId, 'reveal_triggered', null, null, {
    question_id: round.question_id,
    correct_index: question.correct,
    answer_stats: answerStats,
  })

  return { answerStats, correctIndex: question.correct }
}

export async function completeQuestion(roundId: string, gameId: string) {
  const client = db()
  await client.from('rounds').update({ status: 'complete' as RoundStatus }).eq('id', roundId)

  // Check if more questions remain
  const { data: pending } = await client
    .from('rounds')
    .select('id')
    .eq('game_id', gameId)
    .eq('status', 'pending')
    .limit(1)

  if (!pending?.length) {
    // No more questions — end game
    await client.from('games').update({
      status: 'finished' as GameStatus,
      ended_at: new Date().toISOString(),
    }).eq('id', gameId)
    await logEvent(gameId, null, 'game_ended', null, null, {})
    return 'finished'
  }

  // Ready for next question
  await client.from('games').update({ status: 'category' as GameStatus }).eq('id', gameId)
  return 'next'
}

// ─── Scoring ───────────────────────────────────────────────────────────────

export async function awardPoints(
  gameId: string,
  playerId: string,
  roundId: string,
  points: number,
  reason: string
) {
  const client = db()
  await client.from('scores').insert({ game_id: gameId, player_id: playerId, round_id: roundId, points, reason })
  const { data: player } = await client.from('players').select('score').eq('id', playerId).single()
  await client.from('players').update({ score: (player?.score ?? 0) + points }).eq('id', playerId)
}

// ─── Events ────────────────────────────────────────────────────────────────

export async function logEvent(
  gameId: string,
  roundId: string | null,
  eventType: string,
  actorId: string | null,
  targetId: string | null,
  payload: Record<string, unknown>
) {
  const client = db()
  await client.from('events').insert({
    game_id: gameId,
    round_id: roundId,
    event_type: eventType,
    actor_id: actorId,
    target_id: targetId,
    payload,
  })
}
