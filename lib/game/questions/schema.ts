// ─── Question model ────────────────────────────────────────────────────────

export type QuestionType =
  | 'choice'
  | 'truefalse'
  | 'emoji'
  | 'picture'
  | 'closest'
  | 'order'
  | 'mostlikely'
  | 'bluff'

export type Category =
  // Brain
  | 'general' | 'science' | 'history' | 'geography' | 'space' | 'logic' | 'facts' | 'tech' | 'words' | 'mythology' | 'body'
  // Pop culture
  | 'anime' | 'movies' | 'music' | 'gaming' | 'internet' | 'heroes' | 'cartoons' | 'books' | 'afromusic'
  // Sports
  | 'sports' | 'football' | 'basketball' | 'motorsport' | 'olympics' | 'racket'
  // Kenya & Africa
  | 'kenya' | 'africa'
  // Lifestyle
  | 'food' | 'cars' | 'animals' | 'brands' | 'money' | 'fashion'
  // Party modes (not picked as a category, used by social game types)
  | 'party'

interface BaseQuestion {
  id: string
  category: Category
  question: string
  points: number
  speedBonus: number
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice' | 'truefalse'
  options: string[]
  correct: number
}

export interface EmojiQuestion extends BaseQuestion {
  type: 'emoji'
  emoji: string
  options: string[]
  correct: number
}

export interface PictureQuestion extends BaseQuestion {
  type: 'picture'
  image: string
  options: string[]
  correct: number
}

export interface ClosestQuestion extends BaseQuestion {
  type: 'closest'
  answer: number
  min: number
  max: number
  step: number
  unit?: string
}

export interface OrderQuestion extends BaseQuestion {
  type: 'order'
  /** Items listed in the correct order. */
  items: string[]
  /** Short instruction, e.g. "Oldest first". */
  hint: string
}

export interface MostLikelyQuestion extends BaseQuestion {
  type: 'mostlikely'
}

export interface BluffQuestion extends BaseQuestion {
  type: 'bluff'
  answer: string
  /** House answers used when not enough players write a fake. */
  decoys: string[]
}

export type Question =
  | ChoiceQuestion
  | EmojiQuestion
  | PictureQuestion
  | ClosestQuestion
  | OrderQuestion
  | MostLikelyQuestion
  | BluffQuestion

/** Classic questions may omit `type`; they default to 'choice'. */
export type RawChoiceQuestion = Omit<ChoiceQuestion, 'type'> & { type?: 'choice' | 'truefalse' }

/** Types that use the tap-an-option answer pad. */
export const OPTION_TYPES: QuestionType[] = ['choice', 'truefalse', 'emoji', 'picture']

/** Types where a right answer exists and streaks count. */
export function isGradedType(type: QuestionType) {
  return type !== 'mostlikely'
}

// ─── Categories ────────────────────────────────────────────────────────────

export type CategoryGroup = 'brain' | 'pop' | 'sports' | 'local' | 'lifestyle'

export interface CategoryInfo {
  label: string
  emoji: string
  group: CategoryGroup | null
}

export const CATEGORY_GROUPS: { id: CategoryGroup; label: string }[] = [
  { id: 'brain', label: 'Brain' },
  { id: 'pop', label: 'Pop Culture' },
  { id: 'sports', label: 'Sports' },
  { id: 'local', label: 'Kenya & Africa' },
  { id: 'lifestyle', label: 'Lifestyle' },
]

export const CATEGORIES: Record<Category, CategoryInfo> = {
  general:    { label: 'General Knowledge',  emoji: '🧠', group: 'brain' },
  science:    { label: 'Science',            emoji: '🔬', group: 'brain' },
  history:    { label: 'History',            emoji: '🏛️', group: 'brain' },
  geography:  { label: 'Flags & Places',     emoji: '🗺️', group: 'brain' },
  space:      { label: 'Space',              emoji: '🪐', group: 'brain' },
  logic:      { label: 'Riddles & Numbers',  emoji: '🧩', group: 'brain' },
  facts:      { label: 'Wild Facts',         emoji: '⚡', group: 'brain' },
  tech:       { label: 'Tech',               emoji: '💻', group: 'brain' },
  words:      { label: 'Words & Language',   emoji: '🔤', group: 'brain' },
  mythology:  { label: 'Mythology',          emoji: '⚱️', group: 'brain' },
  body:       { label: 'Human Body',         emoji: '🫀', group: 'brain' },

  anime:      { label: 'Anime',              emoji: '⛩️', group: 'pop' },
  movies:     { label: 'Movies & TV',        emoji: '🎬', group: 'pop' },
  music:      { label: 'Music',              emoji: '🎵', group: 'pop' },
  gaming:     { label: 'Gaming',             emoji: '🎮', group: 'pop' },
  internet:   { label: 'Internet Culture',   emoji: '📱', group: 'pop' },
  heroes:     { label: 'Superheroes',        emoji: '🦸', group: 'pop' },
  cartoons:   { label: 'Cartoons',           emoji: '📺', group: 'pop' },
  books:      { label: 'Books & Literature', emoji: '📚', group: 'pop' },
  afromusic:  { label: 'African Music',      emoji: '🥁', group: 'pop' },

  sports:     { label: 'Sports Mix',         emoji: '🏅', group: 'sports' },
  football:   { label: 'Football',           emoji: '⚽', group: 'sports' },
  basketball: { label: 'Basketball',         emoji: '🏀', group: 'sports' },
  motorsport: { label: 'Motorsport',         emoji: '🏎️', group: 'sports' },
  olympics:   { label: 'Athletics & Olympics', emoji: '🏃', group: 'sports' },
  racket:     { label: 'Tennis, Rugby & Cricket', emoji: '🎾', group: 'sports' },

  kenya:      { label: 'Kenya',              emoji: '🇰🇪', group: 'local' },
  africa:     { label: 'Africa',             emoji: '🌍', group: 'local' },

  food:       { label: 'Food & Drinks',      emoji: '🍕', group: 'lifestyle' },
  cars:       { label: 'Cars',               emoji: '🚗', group: 'lifestyle' },
  animals:    { label: 'Animals',            emoji: '🐘', group: 'lifestyle' },
  brands:     { label: 'Brands & Logos',     emoji: '🏷️', group: 'lifestyle' },
  money:      { label: 'Money & Business',   emoji: '💰', group: 'lifestyle' },
  fashion:    { label: 'Fashion',            emoji: '👗', group: 'lifestyle' },

  party:      { label: 'Party',              emoji: '🎉', group: null },
}

export const PICKABLE_CATEGORIES = (Object.keys(CATEGORIES) as Category[]).filter(
  (c) => CATEGORIES[c].group !== null,
)

// ─── Game types ────────────────────────────────────────────────────────────

export interface GameTypeInfo {
  label: string
  short: string
  description: string
  /** Party types ignore the category filter. */
  party?: boolean
}

export const GAME_TYPES: Record<QuestionType, GameTypeInfo> = {
  choice:     { label: 'Classic',            short: 'Pick one',          description: 'Four options, one right answer.' },
  truefalse:  { label: 'True or False',      short: 'True or false',     description: 'Quick calls. Fast fingers win.' },
  emoji:      { label: 'Emoji Decode',       short: 'Decode the emojis', description: 'Guess the title from emojis.' },
  picture:    { label: 'Picture Round',      short: 'Name the picture',  description: 'A blurred image sharpens over time.' },
  closest:    { label: 'Closest Wins',       short: 'Closest number',    description: 'Guess a number. Nearest gets the most.' },
  order:      { label: 'Put in Order',       short: 'Put in order',      description: 'Tap four items in the right order.' },
  mostlikely: { label: 'Most Likely To',     short: 'Vote a player',     description: 'Vote for a player. Side with the room.', party: true },
  bluff:      { label: 'Bluff',              short: 'Write a fake',      description: 'Write a fake answer, then find the real one.', party: true },
}

export const ALL_TYPES = Object.keys(GAME_TYPES) as QuestionType[]

// ─── Game settings ─────────────────────────────────────────────────────────

export interface GameSettings {
  categories: Category[]
  types: QuestionType[]
  timer: number
  questionCount: number
}

export const TIMER_OPTIONS = [10, 20, 30]
export const MIN_QUESTIONS = 3
export const MAX_QUESTIONS = 30

// ─── Shapes sent to the client ─────────────────────────────────────────────

export interface PublicQuestion {
  id: string
  category: Category
  type: QuestionType
  question: string
  points: number
  speedBonus: number
  options?: string[]
  emoji?: string
  image?: string
  min?: number
  max?: number
  step?: number
  unit?: string
  hint?: string
}

// ─── Round data stored on rounds.data ──────────────────────────────────────

export interface RoundData {
  /** order: display index i shows items[perm[i]] */
  perm?: number[]
  /** mostlikely: the players you can vote for */
  players?: { id: string; name: string; avatar: string }[]
  /** bluff: current phase and, in vote phase, the shuffled options */
  phase?: 'write' | 'vote'
  options?: string[]
}

