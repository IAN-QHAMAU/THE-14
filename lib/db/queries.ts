import { createServerSupabase } from './supabase'
import type { Game, Player, Round, GameEvent, PlayerScoreEntry, ActionType, AnswerPayload, RevealPayload, Award, PlayerStats, PlayerTag } from '@/types'

export async function getGameByCode(code: string): Promise<Game | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('games')
    .select('*')
    .eq('game_code', code.toUpperCase())
    .maybeSingle()
  return data
}

export async function getGameById(id: string): Promise<Game | null> {
  const db = createServerSupabase()
  const { data } = await db.from('games').select('*').eq('id', id).maybeSingle()
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

/** The round being played or revealed right now, if any. */
export async function getCurrentRound(gameId: string): Promise<Round | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .in('status', ['active', 'voting', 'locked', 'revealing'])
    .order('round_number')
    .limit(1)
    .maybeSingle()
  return data
}

export async function getMyActions(roundId: string, playerId: string) {
  const db = createServerSupabase()
  const { data } = await db
    .from('actions')
    .select('action_type, payload')
    .eq('round_id', roundId)
    .eq('player_id', playerId)
  const rows = (data ?? []) as { action_type: ActionType; payload: AnswerPayload }[]
  return {
    answer: rows.find((r) => r.action_type === 'answer')?.payload ?? null,
    bluff: rows.find((r) => r.action_type === 'bluff')?.payload ?? null,
    wager: rows.find((r) => r.action_type === 'wager')?.payload ?? null,
    pick: rows.find((r) => r.action_type === 'pick')?.payload ?? null,
  }
}

export async function getRoundActions(roundId: string) {
  const db = createServerSupabase()
  const { data } = await db
    .from('actions')
    .select('player_id, action_type, payload')
    .eq('round_id', roundId)
  return (data ?? []) as { player_id: string; action_type: ActionType; payload: AnswerPayload }[]
}

export async function getRevealForRound(roundId: string): Promise<RevealPayload | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('events')
    .select('payload')
    .eq('round_id', roundId)
    .eq('event_type', 'reveal_triggered')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.payload as RevealPayload | undefined) ?? null
}

export async function getAllReveals(gameId: string): Promise<RevealPayload[]> {
  const db = createServerSupabase()
  const { data } = await db
    .from('events')
    .select('payload')
    .eq('game_id', gameId)
    .eq('event_type', 'reveal_triggered')
    .order('created_at')
  return (data ?? []).map((e) => e.payload as RevealPayload)
}

export async function getLatestReveal(gameId: string): Promise<RevealPayload | null> {
  const db = createServerSupabase()
  const { data } = await db
    .from('events')
    .select('payload')
    .eq('game_id', gameId)
    .eq('event_type', 'reveal_triggered')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.payload as RevealPayload | undefined) ?? null
}

export async function getGameEnd(gameId: string): Promise<{
  awards: Award[]
  stats: Record<string, PlayerStats>
  tags: Record<string, PlayerTag>
}> {
  const db = createServerSupabase()
  const { data } = await db
    .from('events')
    .select('payload')
    .eq('game_id', gameId)
    .eq('event_type', 'game_ended')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const p = (data?.payload ?? {}) as { awards?: Award[]; stats?: Record<string, PlayerStats>; tags?: Record<string, PlayerTag> }
  return { awards: p.awards ?? [], stats: p.stats ?? {}, tags: p.tags ?? {} }
}

export function toScoreEntries(players: Player[]): PlayerScoreEntry[] {
  return players
    .filter((p) => !p.is_game_master)
    .map((p) => ({
      player_id: p.id,
      name: p.name,
      avatar: p.avatar ?? 'ninja',
      total: p.score,
      streak: p.streak ?? 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export async function getGameEvents(gameId: string, limit = 30): Promise<GameEvent[]> {
  const db = createServerSupabase()
  const { data } = await db
    .from('events')
    .select('id, game_id, round_id, event_type, actor_id, target_id, created_at')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map((e) => ({ ...e, payload: {} }))
}
