import { CLASSIC_QUESTIONS } from './classic'
import { MORE_QUESTIONS } from './more'
import { EXTRA_QUESTIONS, EXTRA_TRUE_FALSE, EXTRA_CLOSEST, EXTRA_ORDER } from './extra'
import { TRUE_FALSE, EMOJI, PICTURE, CLOSEST, ORDER, MOST_LIKELY, BLUFF } from './special'
import {
  CATEGORIES,
  GAME_TYPES,
  type Category,
  type GameSettings,
  type Question,
  type QuestionType,
  type PublicQuestion,
  type RawChoiceQuestion,
  type RoundData,
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
  const pool = shuffle(buildPool(settings))
  const count = Math.min(settings.questionCount, pool.length)

  const buckets = new Map<QuestionType, Question[]>()
  for (const q of pool) buckets.set(q.type, [...(buckets.get(q.type) ?? []), q])

  const quizTypes = [...buckets.keys()].filter((t) => !GAME_TYPES[t].party)
  const partyTypes = [...buckets.keys()].filter((t) => GAME_TYPES[t].party)
  const partyCap = quizTypes.length === 0 ? count : Math.max(1, Math.floor(count / 6))

  const picked: Question[] = []
  let partyPicked = 0
  // Weighted round robin: Classic takes two per lap, everything else one.
  const lap = [...quizTypes.flatMap((t) => (t === 'choice' ? [t, t] : [t])), ...partyTypes]
  while (picked.length < count) {
    let progressed = false
    for (const t of lap) {
      if (picked.length >= count) break
      const isParty = GAME_TYPES[t].party
      if (isParty && partyPicked >= partyCap) continue
      const next = buckets.get(t)?.pop()
      if (!next) continue
      picked.push(next)
      if (isParty) partyPicked++
      progressed = true
    }
    if (!progressed) break
  }

  // Spread types out: greedy pick avoiding the previous two types.
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
    if (ordered.length === 0) {
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
  if (type === 'truefalse') return Math.max(8, Math.round(timer * 0.75))
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
    case 'bluff':
      return { ...base, options: roundData?.options ?? [] }
  }
}

export function categoryLabel(c: Category) {
  return CATEGORIES[c]?.label ?? c
}
