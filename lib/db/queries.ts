import { createServerSupabase } from './supabase'
import type { Game, Player, Round, PlayerRole, RoundAssignment, GameEvent } from '@/types'

export async function getGameByCode(code: string): Promise<Game | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('games')
    .select('*')
    .eq('game_code', code.toUpperCase())
    .single()
  return data
}

export async function getGameById(id: string): Promise<Game | null> {
  const db = createServerSupabase()
  const { data } = await db.from('games').select('*').eq('id', id).single()
  return data
}

export async function getPlayers(gameId: string): Promise<Player[]> {
  const db = createServerSupabase()
  const { data } = await db
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('joined_at')
  return data ?? []
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const db = createServerSupabase()
  const { data } = await db.from('players').select('*').eq('id', playerId).single()
  return data
}

export async function getCurrentRound(gameId: string): Promise<Round | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .not('status', 'eq', 'complete')
    .order('round_number')
    .limit(1)
    .single()
  return data
}

export async function getRounds(gameId: string): Promise<Round[]> {
  const db = createServerSupabase()
  const { data } = await db
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .order('round_number')
  return data ?? []
}

export async function getPlayerRole(playerId: string, gameId: string): Promise<PlayerRole | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('player_roles')
    .select('*')
    .eq('player_id', playerId)
    .eq('game_id', gameId)
    .single()
  return data
}

export async function getRoundAssignment(
  roundId: string,
  playerId: string
): Promise<RoundAssignment | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('round_assignments')
    .select('*')
    .eq('round_id', roundId)
    .eq('player_id', playerId)
    .single()
  return data
}

export async function hasPlayerSubmitted(roundId: string, playerId: string): Promise<boolean> {
  const db = createServerSupabase()
  const { data } = await db
    .from('actions')
    .select('id')
    .eq('round_id', roundId)
    .eq('player_id', playerId)
    .limit(1)
  return (data?.length ?? 0) > 0
}

export async function getPlayerScores(gameId: string): Promise<
  { player_id: string; name: string; total: number }[]
> {
  const db = createServerSupabase()
  const { data: players } = await db
    .from('players')
    .select('id, name, score')
    .eq('game_id', gameId)
    .eq('is_game_master', false)
    .order('score', { ascending: false })
  return (players ?? []).map((p) => ({ player_id: p.id, name: p.name, total: p.score }))
}

export async function getGameEvents(gameId: string, limit = 50): Promise<GameEvent[]> {
  const db = createServerSupabase()
  const { data } = await db
    .from('events')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getSubmissionStatus(
  roundId: string,
  playerIds: string[]
): Promise<Record<string, boolean>> {
  const db = createServerSupabase()
  const { data } = await db
    .from('actions')
    .select('player_id')
    .eq('round_id', roundId)
    .in('player_id', playerIds)

  const submitted = new Set((data ?? []).map((a) => a.player_id))
  return Object.fromEntries(playerIds.map((id) => [id, submitted.has(id)]))
}
