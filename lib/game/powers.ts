export type PowerCard = 'freeze' | 'steal' | 'shuffle' | 'shield' | 'double'

export const POWER_CARDS: Record<PowerCard, { label: string; emoji: string; blurb: string; needsTarget: boolean }> = {
  freeze: { label: 'Freeze', emoji: '❄️', blurb: 'Their next question starts 5 seconds late.', needsTarget: true },
  steal: { label: 'Steal', emoji: '🫳', blurb: 'Take 50 points from the player just above you.', needsTarget: false },
  shuffle: { label: 'Shuffle', emoji: '🔀', blurb: 'Their answer buttons keep jumping around next question.', needsTarget: true },
  shield: { label: 'Shield', emoji: '🛡️', blurb: 'Blocks the next card played on you. Works by itself.', needsTarget: false },
  double: { label: 'Double Down', emoji: '✌️', blurb: 'Next question: right answer counts double, wrong costs 100.', needsTarget: false },
}

export const POWER_IDS = Object.keys(POWER_CARDS) as PowerCard[]

/** Every three right answers in a row earns a card. */
export const STREAK_FOR_CARD = 3
export const FREEZE_MS = 5000
export const STEAL_POINTS = 50
export const DOUBLE_DOWN_LOSS = 100

export interface PowerEvent {
  id: string
  event_type: string
  actor_id: string | null
  target_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface PowerState {
  /** The card each player is holding, if any. */
  held: Record<string, PowerCard>
  /** Cards that take effect on a given question number. */
  effects: Record<number, { frozen: string[]; shuffled: string[]; doubled: string[] }>
}

/** Replays the power events in order to work out who holds what and what is active. */
export function powerState(events: PowerEvent[]): PowerState {
  const held: Record<string, PowerCard> = {}
  const effects: PowerState['effects'] = {}
  const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at))
  for (const e of sorted) {
    const card = e.payload?.card as PowerCard | undefined
    if (e.event_type === 'power_earned' && e.actor_id && card && !held[e.actor_id]) held[e.actor_id] = card
    if (e.event_type === 'power_played' && e.actor_id) {
      delete held[e.actor_id]
      // A shield used up blocking a card.
      if (e.payload?.blockedBy && e.target_id) delete held[e.target_id]
      const round = Number(e.payload?.forRound)
      if (e.payload?.blockedBy || !round || !card) continue
      const fx = (effects[round] ??= { frozen: [], shuffled: [], doubled: [] })
      if (card === 'freeze' && e.target_id) fx.frozen.push(e.target_id)
      if (card === 'shuffle' && e.target_id) fx.shuffled.push(e.target_id)
      if (card === 'double') fx.doubled.push(e.actor_id)
    }
  }
  return { held, effects }
}

/** A short line for the feed on every screen. */
export function powerLine(e: PowerEvent, name: (id: string | null) => string) {
  const card = e.payload?.card as PowerCard | undefined
  if (!card) return ''
  const who = name(e.actor_id)
  if (e.event_type === 'power_earned') return `${who} earned ${POWER_CARDS[card].emoji} ${POWER_CARDS[card].label}`
  if (e.payload?.blockedBy) return `🛡️ ${name(e.target_id)} blocked ${who}'s ${POWER_CARDS[card].label}`
  if (card === 'freeze') return `❄️ ${who} froze ${name(e.target_id)}`
  if (card === 'shuffle') return `🔀 ${who} shuffled ${name(e.target_id)}`
  if (card === 'steal') return `🫳 ${who} stole ${e.payload?.amount ?? STEAL_POINTS} from ${name(e.target_id)}`
  if (card === 'double') return `✌️ ${who} is going Double Down`
  return ''
}
