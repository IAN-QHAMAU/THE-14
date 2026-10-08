import type { Category } from '@/lib/game/questions'

export type GameStatus = 'waiting' | 'category' | 'active' | 'question_result' | 'finished'
export type RoundStatus = 'pending' | 'active' | 'locked' | 'revealing' | 'complete'
export type ActionType = 'answer'

export interface Game {
  id: string
  game_code: string
  status: GameStatus
  current_round: number
  max_players: number
  category: Category | null
  total_questions: number
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export interface Player {
  id: string
  game_id: string
  name: string
  avatar: string
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
  question_id: string
  status: RoundStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface Action {
  id: string
  round_id: string
  player_id: string
  action_type: ActionType
  payload: {
    option_index: number
    answered_at: string
    time_taken_ms: number
  }
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

export interface AnswerStat {
  optionIndex: number
  count: number
  percentage: number
}

export interface RevealData {
  correctIndex: number
  answerStats: AnswerStat[]
  questionId: string
}

export interface PlayerScoreEntry {
  player_id: string
  name: string
  avatar: string
  total: number
}
