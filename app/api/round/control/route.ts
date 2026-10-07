import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServerSupabase } from '@/lib/db/supabase'
import {
  startGame,
  startRound,
  lockRound,
  revealRound,
  completeRound,
  endGame,
  awardPoints,
  logEvent,
  DEFAULT_ROLES,
} from '@/lib/game/stateMachine'
import { getGameById, getPlayers, getCurrentRound, getRounds } from '@/lib/db/queries'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.isGameMaster) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
  }

  const { action } = await req.json()
  const { gameId } = session
  const db = createServerSupabase()

  const game = await getGameById(gameId)
  if (!game) return NextResponse.json({ error: 'Game not found.' }, { status: 404 })

  switch (action) {
    case 'start_game': {
      const players = await getPlayers(gameId)
      const realPlayers = players.filter((p) => !p.is_game_master)
      if (realPlayers.length < 2) {
        return NextResponse.json({ error: 'Need at least 2 players.' }, { status: 400 })
      }

      // Assign roles
      const shuffled = [...DEFAULT_ROLES].sort(() => Math.random() - 0.5)
      const roleInserts = realPlayers.map((p, i) => ({
        game_id: gameId,
        player_id: p.id,
        ...shuffled[i % shuffled.length],
      }))
      await db.from('player_roles').insert(roleInserts)

      // Seed round assignments
      const rounds = await getRounds(gameId)
      for (const round of rounds) {
        const assignments = realPlayers.map((p, i) => ({
          round_id: round.id,
          player_id: p.id,
          assignment: `Your task for ${round.title}`,
          private_instruction: i % 2 === 0
            ? `You receive 100 bonus points if Team B scores above 500 this round.`
            : `You receive 100 bonus points if Team A scores above 500 this round.`,
          team: i % 2 === 0 ? 'B' : 'A',
        }))
        await db.from('round_assignments').insert(assignments)
      }

      await startGame(gameId)
      return NextResponse.json({ success: true })
    }

    case 'start_round': {
      const rounds = await getRounds(gameId)
      const pending = rounds.find((r) => r.status === 'pending' || r.status === 'briefing')
      if (!pending) return NextResponse.json({ error: 'No pending round.' }, { status: 400 })

      // Move to briefing first if pending
      if (pending.status === 'pending') {
        await db.from('rounds').update({ status: 'briefing' }).eq('id', pending.id)
        await db.from('games').update({ status: 'active' }).eq('id', gameId)
        return NextResponse.json({ success: true, phase: 'briefing' })
      }

      await startRound(pending.id, gameId, 120)
      return NextResponse.json({ success: true, phase: 'active' })
    }

    case 'lock_round': {
      const round = await getCurrentRound(gameId)
      if (!round) return NextResponse.json({ error: 'No active round.' }, { status: 400 })
      await lockRound(round.id, gameId)
      return NextResponse.json({ success: true })
    }

    case 'reveal': {
      const round = await getCurrentRound(gameId)
      if (!round) return NextResponse.json({ error: 'No round to reveal.' }, { status: 400 })

      await revealRound(round.id, gameId)

      // Score based on actions
      const { data: actions } = await db
        .from('actions')
        .select('player_id, payload')
        .eq('round_id', round.id)

      const { data: assignments } = await db
        .from('round_assignments')
        .select('player_id, team')
        .eq('round_id', round.id)

      if (actions && assignments) {
        // Tally team split
        const splits = actions.map((a) => {
          const p = a.payload as Record<string, number>
          return { player_id: a.player_id, teamA: p.teamA ?? 500, teamB: p.teamB ?? 500 }
        })
        const avgA = splits.reduce((s, x) => s + x.teamA, 0) / (splits.length || 1)
        const avgB = 1000 - avgA

        for (const assign of assignments) {
          const won = (assign.team === 'B' && avgB > 500) || (assign.team === 'A' && avgA > 500)
          if (won) {
            await awardPoints(gameId, assign.player_id, round.id, 100, `Team ${assign.team} won this round.`)
          }
        }

        // Update revealing payload on game
        await db.from('games').update({
          status: 'revealing',
        } as never).eq('id', gameId)
      }

      return NextResponse.json({ success: true })
    }

    case 'next_round': {
      const round = await getCurrentRound(gameId)
      if (!round) return NextResponse.json({ error: 'No round.' }, { status: 400 })
      await completeRound(round.id, gameId)

      const rounds = await getRounds(gameId)
      const allDone = rounds.every((r) => r.status === 'complete' || r.id === round.id)
      if (allDone) {
        await endGame(gameId)
      } else {
        await db.from('games').update({ status: 'active' }).eq('id', gameId)
      }

      return NextResponse.json({ success: true })
    }

    case 'trigger_event': {
      const round = await getCurrentRound(gameId)
      await logEvent(gameId, round?.id ?? null, 'secret_action', null, null, {
        message: 'Someone has triggered a secret action. The group has 30 seconds to respond.',
      })
      return NextResponse.json({ success: true })
    }

    case 'pause_game': {
      await db.from('games').update({ status: 'waiting' }).eq('id', gameId)
      return NextResponse.json({ success: true })
    }

    default:
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  }
}
