import { supabase } from '@/lib/db/supabase'
import type { Game, Player, Round, GameEvent } from '@/types'

export function subscribeToGame(gameId: string, onUpdate: (game: Game) => void) {
  return supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      (payload) => onUpdate(payload.new as Game)
    )
    .subscribe()
}

export function subscribeToPlayers(gameId: string, onUpdate: (players: Player[]) => void) {
  return supabase
    .channel(`players:${gameId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
      async () => {
        const { data } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId)
          .order('joined_at')
        if (data) onUpdate(data as Player[])
      }
    )
    .subscribe()
}

export function subscribeToRounds(gameId: string, onUpdate: (round: Round) => void) {
  return supabase
    .channel(`rounds:${gameId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rounds', filter: `game_id=eq.${gameId}` },
      (payload) => {
        if (payload.new) onUpdate(payload.new as Round)
      }
    )
    .subscribe()
}

export function subscribeToEvents(gameId: string, onEvent: (event: GameEvent) => void) {
  return supabase
    .channel(`events:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'events', filter: `game_id=eq.${gameId}` },
      (payload) => onEvent(payload.new as GameEvent)
    )
    .subscribe()
}

export function subscribeToActions(roundId: string, onUpdate: () => void) {
  return supabase
    .channel(`actions:${roundId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'actions', filter: `round_id=eq.${roundId}` },
      () => onUpdate()
    )
    .subscribe()
}
