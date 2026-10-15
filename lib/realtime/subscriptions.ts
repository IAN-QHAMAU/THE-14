import { supabase } from '@/lib/db/supabase'

// Each subscription just signals that something changed; callers refetch the
// full state from the API, which filters out anything players should not see.

export function subscribeToGame(gameId: string, onChange: () => void) {
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, onChange)
    .subscribe()
}

// New players only. Updates are mostly presence check-ins, which would make
// every phone refetch constantly; score changes, rejoins and removals are
// announced through the events table instead.
export function subscribeToPlayers(gameId: string, onChange: () => void) {
  return supabase
    .channel(`players:${gameId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` }, onChange)
    .subscribe()
}

export function subscribeToRounds(gameId: string, onChange: () => void) {
  return supabase
    .channel(`rounds:${gameId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds', filter: `game_id=eq.${gameId}` }, onChange)
    .subscribe()
}

export function subscribeToEvents(gameId: string, onChange: () => void) {
  return supabase
    .channel(`events:${gameId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: `game_id=eq.${gameId}` }, onChange)
    .subscribe()
}

export function subscribeToActions(roundId: string, onChange: () => void) {
  return supabase
    .channel(`actions:${roundId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions', filter: `round_id=eq.${roundId}` }, onChange)
    .subscribe()
}

// Live emoji reactions use a broadcast channel. Nothing is stored.
export interface ReactionMessage {
  emoji: string
  player_id: string
  name: string
}

export function reactionChannel(gameId: string, onReaction: (r: ReactionMessage) => void) {
  return supabase
    .channel(`reactions:${gameId}`, { config: { broadcast: { self: true } } })
    .on('broadcast', { event: 'react' }, ({ payload }) => onReaction(payload as ReactionMessage))
    .subscribe()
}
