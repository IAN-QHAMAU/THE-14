// Presence: each player's phone checks in through the state API. A player
// who has not checked in for a while is shown as away, does not hold up auto
// reveal, and their seat can be reclaimed by someone joining with their name.

/** Seen within this long counts as active. */
export const ACTIVE_MS = 60_000
/** Only write a check-in when the last one is older than this. */
export const HEARTBEAT_MS = 20_000

export function isActive(lastSeenAt: string | null | undefined, now = Date.now()) {
  if (!lastSeenAt) return false
  return now - Date.parse(lastSeenAt) < ACTIVE_MS
}

export function sameName(a: string, b: string) {
  return a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ')
}

export type SeatDecision =
  | { kind: 'reclaim'; playerId: string }
  | { kind: 'taken'; name: string }
  | { kind: 'new' }

/**
 * Decides where a joining player sits, so the same person never ends up in
 * the game twice. `mineId` is the player id from this phone's session for
 * this game, if any.
 */
export function decideSeat(
  players: { id: string; name: string; last_seen_at: string | null }[],
  name: string,
  mineId: string | null,
  now = Date.now(),
): SeatDecision {
  const mine = mineId ? players.find((p) => p.id === mineId) : undefined
  const namesake = players.find((p) => sameName(p.name, name))
  if (namesake && namesake.id !== mine?.id && isActive(namesake.last_seen_at, now)) {
    return { kind: 'taken', name: namesake.name }
  }
  const seat = mine ?? namesake
  return seat ? { kind: 'reclaim', playerId: seat.id } : { kind: 'new' }
}
