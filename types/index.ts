import type { Category, GameSettings, PublicQuestion, RoundData } from '@/lib/game/questions'
import type { AnswerPayload, AnswerStat, Award, PlayerStats, PlayerTag, RevealPayload } from '@/lib/game/scoring'

export type { AnswerPayload, AnswerStat, Award, PlayerStats, PlayerTag, RevealPayload, PublicQuestion, RoundData }

export type GameStatus = 'waiting' | 'category' | 'active' | 'question_result' | 'leaderboard' | 'finished'
export type RoundStatus = 'pending' | 'active' | 'voting' | 'locked' | 'revealing' | 'complete'
export type ActionType = 'answer' | 'bluff' | 'wager' | 'pick'

export interface Game {
  id: string
  game_code: string
  status: GameStatus
  current_round: number
  max_players: number
  category: Category | 'mix' | null
  settings: Partial<GameSettings>
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
  streak: number
  best_streak: number
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
  data: RoundData
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface Action {
  id: string
  round_id: string
  player_id: string
  action_type: ActionType
  payload: AnswerPayload
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

export interface PlayerScoreEntry {
  player_id: string
  name: string
  avatar: string
  total: number
  streak: number
}

/** Everything /api/game/state returns. */
export interface GameStateResponse {
  /** When the server received the request (ms). */
  serverStart: number
  /** When the server sent the response (ms). */
  serverNow: number
  game: Game
  players: Player[]
  myPlayer: Player | null
  isGameMaster: boolean
  currentRound: Round | null
  currentQuestion: PublicQuestion | null
  myAnswer: AnswerPayload | null
  myBluff: string | null
  /** Final Wager: your bet, once placed. */
  myWager: number | null
  /** Sync: your own answer, when you are on the spot. */
  myPick: number | null
  /** Sync: your own written answer, if you wrote one. */
  myPickText: string | null
  /** Sketch: the word to draw, when you are the artist. */
  myWord: string | null
  /** Team Battle: each player's side. */
  teams: Record<string, 'amber' | 'teal'>
  /** Team Battle: each team's name, icon, colour and captain. */
  teamMeta: Record<'amber' | 'teal', { name: string; icon: string; colour: string; captainId: string | null }>
  /** Power-ups: the card you hold, what is active on you this question, and the recent plays. */
  myCard: 'freeze' | 'steal' | 'shuffle' | 'shield' | 'double' | null
  myEffects: { frozen: boolean; shuffled: boolean; doubled: boolean } | null
  powerFeed: { id: string; text: string; at: string }[]
  submissionStatus: Record<string, boolean>
  answeredCount: number
  reveal: RevealPayload | null
  lastReveal: RevealPayload | null
  scores: PlayerScoreEntry[]
  myRank: number
  myScore: number
  awards: Award[]
  /** Final per-player stats and tags, once the game is finished. */
  stats: Record<string, PlayerStats>
  tags: Record<string, PlayerTag>
  events: GameEvent[]
}
