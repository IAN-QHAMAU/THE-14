import {
  OPTION_TYPES,
  isGradedType,
  seededRandom,
  shuffle,
  type BluffQuestion,
  type Question,
  type QuestionType,
  type RoundData,
} from '@/lib/game/questions'

// ─── Shared shapes ─────────────────────────────────────────────────────────

/** Answers under this many milliseconds count as "too fast". */
export const TOO_FAST_MS = 1200
/** Bonus per question while on a streak of 3 or more. */
export const STREAK_BONUS = 50
/** Points a bluffer earns for each player who picks their fake. */
export const FOOL_POINTS = 75
/** Points the Sync player earns for each friend who reads them right. */
export const READ_POINTS = 50

/** Final Wager: bet up to half your points, and at least 200 so everyone can play. */
export function maxWager(score: number) {
  return Math.max(200, Math.floor(score / 2))
}

export interface AnswerPayload {
  option_index?: number
  value?: number
  order?: number[]
  text?: string
  answered_at: string
  time_taken_ms: number
  too_fast?: boolean
}

export interface AnswerRow {
  player_id: string
  action_type: string
  payload: AnswerPayload
}

export interface PlayerResult {
  answered: boolean
  /** null when there is no right answer (Most Likely To). */
  correct: boolean | null
  points: number
  tooFast: boolean
  timeMs: number | null
  streak: number
  streakBonus: number
  /** Length of the streak that just ended, if it was 3 or more. */
  lostStreak: number
  /** Order: how many items were in the right spot. */
  positions?: number
  /** Closest: the player's guess and how far off it was. */
  guess?: number
  diff?: number
  /** Bluff: how many players picked your fake, and whose fake you picked. */
  fooled?: number
  fellFor?: string[]
  /** Final Wager: your bet, won if correct is true. */
  wager?: number
  /** Fastest Finger: you were the first right answer. */
  first?: boolean
  /** Sync: how many friends guessed your answer. */
  readBy?: number
  /** Power-ups: you went Double Down, or earned a card with this answer. */
  doubled?: boolean
  earned?: 'freeze' | 'steal' | 'shuffle' | 'shield' | 'double'
}

export interface AnswerStat {
  optionIndex: number
  count: number
  percentage: number
}

export interface RevealPayload {
  type: QuestionType
  correct_index: number | null
  correct_indices: number[]
  answer_stats: AnswerStat[]
  options: string[]
  answer_value?: number
  unit?: string
  guesses?: { player_id: string; value: number; diff: number }[]
  correct_order?: string[]
  fully_correct?: number
  option_authors?: string[][]
  /** Odd One Out: why the answer is the odd one, and what each picture is. */
  explain?: string
  option_labels?: string[]
  /** Fastest Finger: who got the right answer first. */
  first_player_id?: string
  /** Sync: who went first, and how many guessed them right. */
  sync_id?: string
  /** Final Wager: this was the bet round. */
  wager?: boolean
  results: Record<string, PlayerResult>
  rank_before: Record<string, number>
  rank_after: Record<string, number>
}

export interface GradePlayer {
  id: string
  score: number
  streak: number
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function normalizeText(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '')
}

/**
 * One house style for every answer shown side by side, so nobody can spot
 * the real one (or a friend's) by how it is typed: single spaces, no full
 * stop at the end, SHOUTING calmed down, and a capital first letter.
 */
export function tidyAnswer(s: string) {
  let t = s.trim().replace(/\s+/g, ' ').replace(/[.!,;:]+$/, '')
  const letters = t.replace(/[^A-Za-z]/g, '')
  // Short all caps words are usually acronyms (NASA, KFC), so they stay.
  if (letters.length > 4 && letters === letters.toUpperCase()) t = t.toLowerCase()
  // Leave names like iPhone and eBay alone.
  if (/^[a-z][A-Z]/.test(t)) return t
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function computeRanks(scores: Record<string, number>): Record<string, number> {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const ranks: Record<string, number> = {}
  entries.forEach(([id, score], i) => {
    ranks[id] = i > 0 && entries[i - 1][1] === score ? ranks[entries[i - 1][0]] : i + 1
  })
  return ranks
}

function stats(counts: number[], total: number): AnswerStat[] {
  return counts.map((count, optionIndex) => ({
    optionIndex,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }))
}

function speedBonusFor(rank: number, bonus: number) {
  if (rank === 0) return bonus
  if (rank === 1) return Math.floor(bonus / 2)
  if (rank === 2) return Math.floor(bonus / 4)
  return 0
}

function byTime(a: AnswerRow, b: AnswerRow) {
  return (a.payload.time_taken_ms ?? 1e9) - (b.payload.time_taken_ms ?? 1e9)
}

/**
 * Sync: the options everyone guesses from. A written answer takes the place
 * of one ready made option, and every option gets the same house style, so
 * the written one does not stand out.
 */
export function buildSyncOptions(presets: string[], pick: AnswerPayload | undefined, seed: string): string[] {
  const random = seededRandom(seed)
  const own = pick?.text ? tidyAnswer(pick.text) : null
  const matches = own ? presets.findIndex((p) => normalizeText(p) === normalizeText(own)) : -1
  let options = presets.map(tidyAnswer)
  if (own && matches < 0) {
    const drop = Math.floor(random() * options.length)
    options = [...options.filter((_, i) => i !== drop), own]
  }
  return shuffle(options, random)
}

/** Build the shuffled options for the vote phase of a bluff round. */
export function buildBluffOptions(question: BluffQuestion, writes: AnswerRow[], seed: string): string[] {
  const real = normalizeText(question.answer)
  const seen = new Set<string>([real])
  const fakes: string[] = []
  for (const w of writes) {
    const text = (w.payload.text ?? '').trim()
    const key = normalizeText(text)
    if (!key || seen.has(key)) continue
    seen.add(key)
    fakes.push(tidyAnswer(text))
  }
  for (const d of question.decoys) {
    if (fakes.length >= 2) break
    const key = normalizeText(d)
    if (seen.has(key)) continue
    seen.add(key)
    fakes.push(tidyAnswer(d))
  }
  return shuffle([...fakes, tidyAnswer(question.answer)], seededRandom(seed))
}

// ─── Grading ───────────────────────────────────────────────────────────────

interface Graded {
  correct: boolean | null
  points: number
  extra?: Partial<PlayerResult>
}

export function gradeRound(input: {
  question: Question
  data: RoundData
  answers: AnswerRow[]
  players: GradePlayer[]
}): Omit<RevealPayload, 'rank_before' | 'rank_after'> {
  const { question: q, data, players } = input
  const answers = input.answers.filter((a) => a.action_type === 'answer')
  const writes = input.answers.filter((a) => a.action_type === 'bluff')
  const byPlayer = new Map(answers.map((a) => [a.player_id, a]))
  const graded = new Map<string, Graded>()

  const reveal: Omit<RevealPayload, 'rank_before' | 'rank_after' | 'results'> = {
    type: q.type,
    correct_index: null,
    correct_indices: [],
    answer_stats: [],
    options: [],
  }

  switch (q.type) {
    case 'choice':
    case 'truefalse':
    case 'emoji':
    case 'picture':
    case 'oddone': {
      if (q.type === 'oddone') {
        reveal.explain = q.why
        reveal.option_labels = q.names
      }
      reveal.options = q.options
      reveal.correct_index = q.correct
      reveal.correct_indices = [q.correct]
      const counts = q.options.map(() => 0)
      for (const a of answers) {
        const i = a.payload.option_index ?? -1
        if (i >= 0 && i < counts.length) counts[i]++
      }
      reveal.answer_stats = stats(counts, answers.length)
      const right = answers.filter((a) => a.payload.option_index === q.correct).sort(byTime)
      right.forEach((a, rank) => {
        graded.set(a.player_id, { correct: true, points: q.points + speedBonusFor(rank, q.speedBonus) })
      })
      for (const a of answers) if (!graded.has(a.player_id)) graded.set(a.player_id, { correct: false, points: 0 })
      break
    }

    case 'fastest': {
      // Only the first right answer scores, worth double. Other right answers
      // still keep their streak.
      reveal.options = q.options
      reveal.correct_index = q.correct
      reveal.correct_indices = [q.correct]
      const counts = q.options.map(() => 0)
      for (const a of answers) {
        const i = a.payload.option_index ?? -1
        if (i >= 0 && i < counts.length) counts[i]++
      }
      reveal.answer_stats = stats(counts, answers.length)
      const right = answers.filter((a) => a.payload.option_index === q.correct).sort(byTime)
      reveal.first_player_id = right[0]?.player_id
      right.forEach((a, rank) => {
        graded.set(a.player_id, { correct: true, points: rank === 0 ? q.points * 2 : 0, extra: { first: rank === 0 } })
      })
      for (const a of answers) if (!graded.has(a.player_id)) graded.set(a.player_id, { correct: false, points: 0 })
      break
    }

    case 'sync': {
      const spotId = data.sync?.id
      const pick = input.answers.find((a) => a.action_type === 'pick' && a.player_id === spotId)
      const options = data.options ?? q.options
      // The answer as text, whether it was picked from the list or written.
      const pickedText = pick?.payload.text ?? (pick?.payload.option_index != null ? q.options[pick.payload.option_index] : null)
      const picked = pickedText ? options.findIndex((o) => normalizeText(o) === normalizeText(pickedText)) : -1
      reveal.options = options
      reveal.sync_id = spotId
      const guesses = answers.filter((a) => a.player_id !== spotId)
      const counts = options.map(() => 0)
      for (const a of guesses) {
        const i = a.payload.option_index ?? -1
        if (i >= 0 && i < counts.length) counts[i]++
      }
      reveal.answer_stats = stats(counts, guesses.length)
      if (picked < 0 || !spotId) break
      reveal.correct_index = picked
      reveal.correct_indices = [picked]
      let readBy = 0
      for (const a of guesses) {
        const right = a.payload.option_index === picked
        if (right) readBy++
        graded.set(a.player_id, { correct: right, points: right ? q.points : 0 })
      }
      graded.set(spotId, { correct: null, points: readBy * READ_POINTS, extra: { readBy } })
      break
    }

    case 'closest': {
      reveal.answer_value = q.answer
      reveal.unit = q.unit
      const range = Math.max(1, q.max - q.min)
      const guesses = answers
        .filter((a) => typeof a.payload.value === 'number')
        .map((a) => ({ player_id: a.player_id, value: a.payload.value!, diff: Math.abs(a.payload.value! - q.answer) }))
        .sort((a, b) => a.diff - b.diff)
      reveal.guesses = guesses
      const best = guesses.length ? guesses[0].diff : Infinity
      for (const g of guesses) {
        const closeness = Math.max(0, 1 - g.diff / (range * 0.2))
        const isBest = g.diff === best
        graded.set(g.player_id, {
          correct: isBest || closeness >= 0.75,
          points: Math.round(q.points * closeness) + (isBest ? q.speedBonus : 0),
          extra: { guess: g.value, diff: g.diff },
        })
      }
      break
    }

    case 'order': {
      const perm = data.perm ?? q.items.map((_, i) => i)
      reveal.options = perm.map((i) => q.items[i])
      reveal.correct_order = q.items
      const n = q.items.length
      const scored = answers.map((a) => {
        const order = a.payload.order ?? []
        const positions = order.filter((d, i) => perm[d] === i).length
        return { a, positions }
      })
      const full = scored.filter((s) => s.positions === n).map((s) => s.a).sort(byTime)
      reveal.fully_correct = full.length
      for (const s of scored) {
        const rank = full.indexOf(s.a)
        graded.set(s.a.player_id, {
          correct: s.positions === n,
          points: s.positions === n
            ? q.points + speedBonusFor(rank, q.speedBonus)
            : Math.round(q.points * 0.5 * (s.positions / n)),
          extra: { positions: s.positions },
        })
      }
      break
    }

    case 'mostlikely':
    case 'wouldrather': {
      // Vote modes: no right answer, siding with the majority scores.
      const options = q.type === 'wouldrather' ? q.options : (data.players ?? []).map((p) => p.name)
      reveal.options = options
      const counts = options.map(() => 0)
      for (const a of answers) {
        const i = a.payload.option_index ?? -1
        if (i >= 0 && i < counts.length) counts[i]++
      }
      reveal.answer_stats = stats(counts, answers.length)
      const max = Math.max(0, ...counts)
      reveal.correct_indices = max > 0 ? counts.flatMap((c, i) => (c === max ? [i] : [])) : []
      for (const a of answers) {
        const sided = reveal.correct_indices.includes(a.payload.option_index ?? -1)
        graded.set(a.player_id, { correct: null, points: sided ? q.points : 0 })
      }
      break
    }

    case 'bluff': {
      const options = data.options ?? []
      reveal.options = options
      const realKey = normalizeText(q.answer)
      const realIndex = options.findIndex((o) => normalizeText(o) === realKey)
      reveal.correct_index = realIndex
      reveal.correct_indices = realIndex >= 0 ? [realIndex] : []
      const authors = options.map((o) =>
        writes.filter((w) => normalizeText(w.payload.text ?? '') === normalizeText(o)).map((w) => w.player_id),
      )
      reveal.option_authors = authors
      const counts = options.map(() => 0)
      for (const a of answers) {
        const i = a.payload.option_index ?? -1
        if (i >= 0 && i < counts.length) counts[i]++
      }
      reveal.answer_stats = stats(counts, answers.length)

      const fooled = new Map<string, number>()
      for (const a of answers) {
        const i = a.payload.option_index ?? -1
        if (i === realIndex) continue
        for (const author of authors[i] ?? []) fooled.set(author, (fooled.get(author) ?? 0) + 1)
      }
      for (const p of players) {
        const a = byPlayer.get(p.id)
        const foolCount = fooled.get(p.id) ?? 0
        const pickedReal = a?.payload.option_index === realIndex
        if (!a && foolCount === 0) continue
        graded.set(p.id, {
          correct: pickedReal,
          points: (pickedReal ? q.points : 0) + foolCount * FOOL_POINTS,
          extra: {
            fooled: foolCount,
            fellFor: a && !pickedReal ? authors[a.payload.option_index ?? -1] ?? [] : [],
          },
        })
      }
      break
    }
  }

  // ── Per player result with streaks ───────────────────────────────────────
  const graded_type = isGradedType(q.type)
  const timed = OPTION_TYPES.includes(q.type)
  const results: Record<string, PlayerResult> = {}

  for (const p of players) {
    const a = byPlayer.get(p.id)
    const g = graded.get(p.id)
    const correct = g?.correct ?? (graded_type ? false : null)
    let streak = p.streak
    let streakBonus = 0
    let lostStreak = 0
    if (graded_type) {
      if (correct) {
        streak = p.streak + 1
        if (streak >= 3) streakBonus = STREAK_BONUS
      } else {
        if (p.streak >= 3) lostStreak = p.streak
        streak = 0
      }
    }
    results[p.id] = {
      answered: Boolean(a),
      correct,
      points: (g?.points ?? 0) + streakBonus,
      tooFast: timed && Boolean(a?.payload.too_fast),
      timeMs: a ? a.payload.time_taken_ms : null,
      streak,
      streakBonus,
      lostStreak,
      ...g?.extra,
    }
  }

  // Final Wager: win your bet if you got it right, lose it if not.
  if (data.wager) {
    reveal.wager = true
    for (const w of input.answers.filter((a) => a.action_type === 'wager')) {
      const r = results[w.player_id]
      const bet = w.payload.value ?? 0
      if (!r || !bet) continue
      r.wager = bet
      r.points += r.correct ? bet : -bet
    }
  }

  return { ...reveal, results }
}

// ─── Awards ────────────────────────────────────────────────────────────────

export interface Award {
  id: string
  title: string
  player_id: string
  detail: string
}

export function computeAwards(
  reveals: RevealPayload[],
  players: { id: string; score: number; best_streak: number }[],
): Award[] {
  if (!reveals.length || !players.length) return []
  const awards: Award[] = []
  const byScore = [...players].sort((a, b) => b.score - a.score)
  const tally = (fn: (r: PlayerResult, rev: RevealPayload) => number) => {
    const totals = new Map<string, number>()
    for (const rev of reveals) {
      for (const [id, r] of Object.entries(rev.results)) totals.set(id, (totals.get(id) ?? 0) + fn(r, rev))
    }
    return totals
  }
  const top = (totals: Map<string, number>, min: number, lowest = false) => {
    let bestId: string | null = null
    let best = lowest ? Infinity : -Infinity
    for (const p of byScore) {
      const v = totals.get(p.id)
      if (v === undefined) continue
      if (lowest ? v < best : v > best) {
        best = v
        bestId = p.id
      }
    }
    return bestId && (lowest ? best <= min : best >= min) ? { id: bestId, value: best } : null
  }

  const sharp = top(tally((r) => (r.correct ? 1 : 0)), 1)
  if (sharp) awards.push({ id: 'sharpest', title: 'Sharpest mind', player_id: sharp.id, detail: `${sharp.value} right` })

  // Fastest average on correct timed answers, minimum two.
  const times = new Map<string, number[]>()
  for (const rev of reveals) {
    if (!OPTION_TYPES.includes(rev.type) && rev.type !== 'order') continue
    for (const [id, r] of Object.entries(rev.results)) {
      if (r.correct && r.timeMs != null) times.set(id, [...(times.get(id) ?? []), r.timeMs])
    }
  }
  const avg = new Map(
    [...times].filter(([, t]) => t.length >= 2).map(([id, t]) => [id, t.reduce((s, x) => s + x, 0) / t.length]),
  )
  const fast = top(avg, Infinity, true)
  if (fast) awards.push({ id: 'fastest', title: 'Fastest finger', player_id: fast.id, detail: `${(fast.value / 1000).toFixed(1)}s average` })

  const streaker = [...players].sort((a, b) => b.best_streak - a.best_streak)[0]
  if (streaker && streaker.best_streak >= 3) {
    awards.push({ id: 'streak', title: 'Hot streak', player_id: streaker.id, detail: `${streaker.best_streak} in a row` })
  }

  if (reveals.length >= 4) {
    const mid = reveals[Math.floor(reveals.length / 2) - 1].rank_after
    const final = reveals[reveals.length - 1].rank_after
    const climb = new Map(Object.keys(final).map((id) => [id, (mid[id] ?? final[id]) - final[id]]))
    const comeback = top(climb, 2)
    if (comeback) awards.push({ id: 'comeback', title: 'Comeback', player_id: comeback.id, detail: `Up ${comeback.value} places` })
  }

  const bold = top(tally((r) => (r.tooFast && r.correct === false ? 1 : 0)), 2)
  if (bold) awards.push({ id: 'bold', title: 'Bold guesser', player_id: bold.id, detail: `${bold.value} speedy misses` })

  const trick = top(tally((r) => r.fooled ?? 0), 1)
  if (trick) awards.push({ id: 'trickster', title: 'Master bluffer', player_id: trick.id, detail: `Fooled ${trick.value}` })

  return awards
}

// ─── Player stats and tags ─────────────────────────────────────────────────
// Every player gets exactly one tag so nobody leaves without something to
// share. Award winners keep their award as their tag.

export interface PlayerStats {
  correct: number
  /** Questions with a right answer (party rounds excluded). */
  graded: number
  answered: number
  /** Average time on correct timed answers, in ms. */
  avgMs: number | null
  bestStreak: number
  /** Places gained from halfway to the end. */
  climb: number
  fastWrong: number
  fooled: number
}

export interface PlayerTag {
  title: string
  detail: string
}

export function computePlayerStats(
  reveals: RevealPayload[],
  players: { id: string; best_streak: number }[],
): Record<string, PlayerStats> {
  const out: Record<string, PlayerStats> = {}
  const times = new Map<string, number[]>()
  for (const p of players) {
    out[p.id] = { correct: 0, graded: 0, answered: 0, avgMs: null, bestStreak: p.best_streak ?? 0, climb: 0, fastWrong: 0, fooled: 0 }
  }
  for (const rev of reveals) {
    const graded = isGradedType(rev.type)
    const timed = OPTION_TYPES.includes(rev.type) || rev.type === 'order'
    for (const p of players) {
      const s = out[p.id]
      const r = rev.results[p.id]
      if (graded) s.graded++
      if (!r) continue
      if (r.answered) s.answered++
      if (r.correct) s.correct++
      if (r.tooFast && r.correct === false) s.fastWrong++
      s.fooled += r.fooled ?? 0
      if (timed && r.correct && r.timeMs != null) times.set(p.id, [...(times.get(p.id) ?? []), r.timeMs])
    }
  }
  for (const [id, t] of times) {
    if (out[id] && t.length) out[id].avgMs = t.reduce((a, b) => a + b, 0) / t.length
  }
  if (reveals.length >= 4) {
    const mid = reveals[Math.floor(reveals.length / 2) - 1].rank_after
    const final = reveals[reveals.length - 1].rank_after
    for (const p of players) {
      if (out[p.id] && mid[p.id] && final[p.id]) out[p.id].climb = mid[p.id] - final[p.id]
    }
  }
  return out
}

export function computeTags(
  stats: Record<string, PlayerStats>,
  players: { id: string; score: number }[],
  awards: Award[],
): Record<string, PlayerTag> {
  const ranked = [...players].sort((a, b) => b.score - a.score)
  const tags: Record<string, PlayerTag> = {}
  ranked.forEach((p, i) => {
    const award = awards.find((a) => a.player_id === p.id)
    if (award) {
      tags[p.id] = { title: award.title, detail: award.detail }
      return
    }
    const s = stats[p.id]
    const rank = ranked.filter((o) => o.score > p.score).length + 1
    const last = i === ranked.length - 1 && ranked.length > 2
    const acc = s && s.graded ? s.correct / s.graded : 0
    const right = s ? `${s.correct} of ${s.graded} right` : ''
    let tag: PlayerTag
    if (rank === 1) tag = { title: 'Champion', detail: `${p.score.toLocaleString()} points` }
    else if (s && s.graded >= 3 && acc >= 0.8) tag = { title: 'Brainbox', detail: right }
    else if (s?.avgMs != null && s.avgMs < 3000) tag = { title: 'Quick draw', detail: `${(s.avgMs / 1000).toFixed(1)}s average` }
    else if (s && s.bestStreak >= 3) tag = { title: 'On fire', detail: `${s.bestStreak} in a row` }
    else if (s && s.climb >= 2) tag = { title: 'Climber', detail: `Up ${s.climb} places` }
    else if (s && s.fooled >= 1) tag = { title: 'Sneaky', detail: `Fooled ${s.fooled}` }
    else if (s && s.fastWrong >= 2) tag = { title: 'Trigger happy', detail: `${s.fastWrong} speedy misses` }
    else if (s && s.graded && s.correct === 0) tag = { title: 'Here for the vibes', detail: 'Next game is yours' }
    else if (last) tag = { title: 'Warming up', detail: 'Next game is yours' }
    else if (s && acc >= 0.5) tag = { title: 'Steady', detail: right }
    else if (s && s.graded && s.answered < s.graded / 2) tag = { title: 'Taking it easy', detail: `${s.answered} answered` }
    else tag = { title: 'Wildcard', detail: right || 'Full of surprises' }
    tags[p.id] = tag
  })
  return tags
}
