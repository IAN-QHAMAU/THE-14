export type GameStatus = 'waiting' | 'briefing' | 'active' | 'revealing' | 'finished'
export type RoundStatus = 'pending' | 'briefing' | 'active' | 'locked' | 'revealing' | 'complete'
export type ActionType = 'vote' | 'choice' | 'accuse' | 'protect' | 'trade' | 'challenge' | 'secret_action'

export interface Game {
  id: string
  game_code: string
  status: GameStatus
  current_round: number
  max_players: number
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export interface Player {
  id: string
  game_id: string
  name: string
  avatar: string | null
  is_game_master: boolean
  is_connected: boolean
  joined_at: string
  last_seen_at: string
  score: number
  status: string
}

export interface Round {
  id: string
  game_id: string
  round_number: number
  title: string
  description: string
  status: RoundStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface PlayerRole {
  id: string
  game_id: string
  player_id: string
  role_name: string
  secret_objective: string
  private_information: string
  special_ability: string | null
  created_at: string
}

export interface RoundAssignment {
  id: string
  round_id: string
  player_id: string
  assignment: string
  private_instruction: string
  target_player_id: string | null
  team: string | null
  created_at: string
}

export interface Action {
  id: string
  round_id: string
  player_id: string
  action_type: ActionType
  payload: Record<string, unknown>
  created_at: string
}

export interface Vote {
  id: string
  round_id: string
  voter_id: string
  target_id: string
  choice: string
  created_at: string
}

export interface GameEvent {
  id: string
  game_id: string
  round_id: string | null
  event_type: string
  actor_id: string | null
  target_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface Score {
  id: string
  game_id: string
  player_id: string
  round_id: string
  points: number
  reason: string
  created_at: string
}

export interface GameState {
  game: Game
  players: Player[]
  currentRound: Round | null
  myPlayer: Player | null
  myRole: PlayerRole | null
  myAssignment: RoundAssignment | null
}
