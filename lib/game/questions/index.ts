import { CLASSIC_QUESTIONS } from './classic'
import { MORE_QUESTIONS } from './more'
import { EXTRA_QUESTIONS, EXTRA_TRUE_FALSE, EXTRA_CLOSEST, EXTRA_ORDER } from './extra'
import { BONUS_QUESTIONS, BONUS_BLUFF, BONUS_MOST_LIKELY, WOULD_RATHER } from './bonus'
import { HARD_A } from './hardA'
import { HARD_B } from './hardB'
import { HARD_C } from './hardC'
import { HARD_TRUE_FALSE, HARD_EMOJI, HARD_CLOSEST, HARD_ORDER } from './hardTypes'
import { ANIME_PACKS } from './anime'
import { FUN_QUESTIONS, FUN_TRUE_FALSE, FUN_EMOJI } from './fun'
import { MORE_WOULD_RATHER, MORE_MOST_LIKELY, MORE_BLUFF } from './party'
import { TRUE_FALSE, EMOJI, PICTURE, CLOSEST, ORDER, MOST_LIKELY, BLUFF } from './special'
import {
  CATEGORIES,
  GAME_TYPES,
  difficultyOf,
  type DifficultySetting,
  type Category,
  type GameSettings,
  type Question,
  type QuestionType,
  type PublicQuestion,
  type RawChoiceQuestion,
  type RoundData,
  MAX_QUESTIONS,
} from './schema'

export * from './schema'

function normalize(q: RawChoiceQuestion): Question {
  return { ...q, type: q.type ?? 'choice' }
}

export const ALL_QUESTIONS: Question[] = [
  ...Object.values(CLASSIC_QUESTIONS).flat().map(normalize),
  ...MORE_QUESTIONS.map(normalize),
  ...EXTRA_QUESTIONS.map(normalize),
  ...EXTRA_TRUE_FALSE,
  ...EXTRA_CLOSEST,
  ...EXTRA_ORDER,
  ...BONUS_QUESTIONS.map(normalize),
  ...BONUS_BLUFF,
  ...BONUS_MOST_LIKELY,
  ...WOULD_RATHER,
  ...HARD_A.map(normalize),
  ...HARD_B.map(normalize),
  ...HARD_C.map(normalize),
  ...HARD_TRUE_FALSE,
  ...HARD_EMOJI,
  ...HARD_CLOSEST,
  ...HARD_ORDER,
  ...ANIME_PACKS.map(normalize),
  ...FUN_QUESTIONS.map(normalize),
  ...FUN_TRUE_FALSE,
  ...FUN_EMOJI,
  ...MORE_WOULD_RATHER,
  ...MORE_MOST_LIKELY,
  ...MORE_BLUFF,
  ...TRUE_FALSE,
  ...EMOJI,
  ...PICTURE,
  ...CLOSEST,
  ...ORDER,
  ...MOST_LIKELY,
  ...BLUFF,
]

const BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]))

export function getQuestionById(id: string): Question | undefined {
  return BY_ID.get(id)
}

/** Number of questions per category and type, for the setup screen. */
export function countQuestions(category: Category, type?: QuestionType) {
  return ALL_QUESTIONS.filter((q) => q.category === category && (!type || q.type === type)).length
}

// ─── Pool building ─────────────────────────────────────────────────────────

export function buildPool(settings: Pick<GameSettings, 'categories' | 'types'>): Question[] {
  const cats = new Set(settings.categories)
  const types = new Set(settings.types)
  return ALL_QUESTIONS.filter((q) => {
    if (!types.has(q.type)) return false
    if (GAME_TYPES[q.type].party) return true
    return cats.has(q.category)
  })
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Deterministic random generator seeded from a string. */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

/**
 * Pick questions for a game. Selected types share the game fairly (Classic
 * gets a double share since it is the backbone), party rounds are capped at
 * about one in six, and the same type never runs three in a row when it can
 * be avoided.
 */
export function pickQuestions(settings: GameSettings): Question[] {
  const level = settings.difficulty ?? 'mixed'
  if (level === 'rising') return pickRising(settings)
  // A chosen level is strict: a Hard game only gets hard questions, even if
  // that makes it shorter. Party rounds have no level and always fit.
  const fits = (q: Question) => level === 'mixed' || GAME_TYPES[q.type].party || difficultyOf(q) === level
  const pool = shuffle(buildPool(settings).filter(fits))
  const count = Math.min(settings.questionCount, pool.length)

  // Buckets are popped from the end, so store them in reverse.
  const buckets = new Map<QuestionType, Question[]>()
  for (const q of pool) {
    const list = buckets.get(q.type)
    if (list) list.push(q)
    else buckets.set(q.type, [q])
  }
  for (const [t, list] of buckets) buckets.set(t, list.reverse())

  const quizTypes = [...buckets.keys()].filter((t) => !GAME_TYPES[t].party)
  const partyTypes = [...buckets.keys()].filter((t) => GAME_TYPES[t].party)
  const partyCap = quizTypes.length === 0 ? count : Math.max(1, Math.floor(count / 6))

  const picked: Question[] = []
  let partyPicked = 0
  // Weighted round robin: Classic takes two per lap, everything else one.
  const lap = [...quizTypes.flatMap((t) => (t === 'choice' ? [t, t] : [t])), ...partyTypes]
  let progressed = true
  while (picked.length < count && progressed) {
    progressed = false
    for (const t of lap) {
      if (picked.length >= count) break
      const isParty = GAME_TYPES[t].party
      if (isParty && partyPicked >= partyCap) continue
      const list = buckets.get(t)
      const next = list?.[list.length - 1]
      if (!next) continue
      list!.pop()
      picked.push(next)
      if (isParty) partyPicked++
      progressed = true
    }
  }

  return spreadTypes(picked)
}

/** Longest game these settings can make, for the setup slider. */
export function maxGameLength(settings: GameSettings) {
  return pickQuestions({ ...settings, questionCount: MAX_QUESTIONS }).length
}

/** Roughly a third each of easy, medium and hard, then ordered easy to hard. */
function pickRising(settings: GameSettings): Question[] {
  const n = settings.questionCount
  const party = settings.types.filter((t) => GAME_TYPES[t].party)
  const quiz = settings.types.filter((t) => !GAME_TYPES[t].party)
  const sizes = [Math.ceil(n / 3), Math.ceil(n / 3), n - 2 * Math.ceil(n / 3)]
  const levels: DifficultySetting[] = ['easy', 'medium', 'hard']
  const seen = new Set<string>()
  const picked: Question[] = []
  levels.forEach((difficulty, i) => {
    // Party rounds only in the middle stretch.
    const types = i === 1 || !quiz.length ? settings.types : quiz
    for (const q of pickQuestions({ ...settings, types, difficulty, questionCount: sizes[i] })) {
      if (!seen.has(q.id)) {
        seen.add(q.id)
        picked.push(q)
      }
    }
  })
  if (picked.length < n) {
    for (const q of pickQuestions({ ...settings, difficulty: 'mixed', questionCount: n * 2 })) {
      if (picked.length >= n) break
      if (!seen.has(q.id) && (party.includes(q.type) ? false : true)) {
        seen.add(q.id)
        picked.push(q)
      }
    }
  }
  return riseInDifficulty(picked.slice(0, n))
}

/** Easy first, hard last. Party rounds sit in the middle stretch. */
function riseInDifficulty(picked: Question[]): Question[] {
  const rank = (q: Question) => (GAME_TYPES[q.type].party ? 1 : { easy: 0, medium: 1, hard: 2 }[difficultyOf(q)])
  const groups = [0, 1, 2].map((r) => picked.filter((q) => rank(q) === r))
  return groups.flatMap((g, i) => spreadTypes(g, i === 0))
}

/** Spread types out: greedy pick avoiding the same type three times running. */
function spreadTypes(picked: Question[], quizFirst = true): Question[] {
  const remaining = shuffle(picked)
  const ordered: Question[] = []
  while (remaining.length) {
    const recent = ordered.slice(-2).map((q) => q.type)
    const prev = ordered[ordered.length - 1]
    let idx = remaining.findIndex(
      (q) =>
        !(recent.length === 2 && recent.every((t) => t === q.type)) &&
        // Keep party rounds apart.
        !(prev && GAME_TYPES[prev.type].party && GAME_TYPES[q.type].party),
    )
    if (idx < 0) idx = 0
    // Do not open the game with a party round.
    if (ordered.length === 0 && quizFirst) {
      const firstQuiz = remaining.findIndex((q) => !GAME_TYPES[q.type].party)
      if (firstQuiz >= 0) idx = firstQuiz
    }
    ordered.push(remaining.splice(idx, 1)[0])
  }
  return ordered
}

// ─── Timing ────────────────────────────────────────────────────────────────

export const GET_READY_MS = 3500

export function answerWindowSeconds(type: QuestionType, timer: number, phase: 'answer' | 'write' = 'answer') {
  if (type === 'bluff' && phase === 'write') return Math.max(timer, 30) + 10
  if (type === 'order') return timer + 10
  if (type === 'closest') return timer + 5
  return timer
}

// ─── Public view (never includes the answer) ───────────────────────────────

export function toPublicQuestion(q: Question, roundData?: RoundData): PublicQuestion {
  const base: PublicQuestion = {
    id: q.id,
    category: q.category,
    type: q.type,
    question: q.question,
    points: q.points,
    speedBonus: q.speedBonus,
  }
  switch (q.type) {
    case 'choice':
    case 'truefalse':
      return { ...base, options: q.options }
    case 'emoji':
      return { ...base, options: q.options, emoji: q.emoji }
    case 'picture':
      return { ...base, options: q.options, image: q.image }
    case 'closest':
      return { ...base, min: q.min, max: q.max, step: q.step, unit: q.unit }
    case 'order': {
      const perm = roundData?.perm ?? q.items.map((_, i) => i)
      return { ...base, options: perm.map((i) => q.items[i]), hint: q.hint }
    }
    case 'mostlikely':
      return { ...base, options: (roundData?.players ?? []).map((p) => p.name) }
    case 'wouldrather':
      return { ...base, options: q.options }
    case 'bluff':
      return { ...base, options: roundData?.options ?? [] }
  }
}

export function categoryLabel(c: Category) {
  return CATEGORIES[c]?.label ?? c
}
