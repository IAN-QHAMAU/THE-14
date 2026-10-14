import type { QuestionType } from '@/lib/game/questions/schema'
import type { PlayerResult } from '@/lib/game/scoring'

const LINES = {
  quickTap: [
    'That was quick. Hope it was right.',
    'Fast. Very fast. We will see.',
    'You barely read that.',
    'Confident, are we?',
  ],
  fastRight: ['Speed demon.', 'Did not even need to think.', 'Fastest fingers in the room.', 'Quick and correct. Show off.'],
  right: ['Nice one.', 'Clean.', 'Knew it.', 'Easy for you, apparently.', 'Correct. Carry on.'],
  onStreak: ['On a roll.', 'Keep it going.', 'Someone stop them.', 'Heating up.'],
  fastWrong: [
    'Bold of you to answer before reading.',
    'Fast fingers, slow luck.',
    'That was quick. Quick and wrong.',
    'You tapped like you knew. You did not.',
    'Confidence: high. Accuracy: low.',
    'Speed was not the problem there.',
  ],
  wrong: [
    'Close. Well, not really.',
    'Respectfully, no.',
    'Somewhere a teacher just sighed.',
    'Not quite. Shake it off.',
    'Bold choice. Wrong, but bold.',
    'Interesting pick.',
  ],
  slowWrong: ['All that thinking and still no.', 'You really took your time with that one.', 'Long think, wrong answer.'],
  missed: [
    'Blink and you missed it.',
    'The timer won that round.',
    'Were you even here for that one?',
    'No answer is also an answer. Just not a good one.',
  ],
  lostStreak: ['And the streak is gone.', 'It was a good run while it lasted.', 'Streak over. Back to work.'],
  closeExact: ['Spot on. Unreal.', 'Exactly right. Suspicious.'],
  closeGood: ['Close enough to count.', 'Nearly there.', 'Not bad at all.'],
  closeMid: ['In the neighbourhood.', 'Not bad. Some points.', 'Warm, not hot.'],
  closeFar: ['Not even close. Respectfully.', 'A brave estimate.', 'Somewhere in the right universe.'],
  orderFull: ['Perfect order.', 'Every one in place.'],
  orderPartial: ['Some of it was right.', 'Half sorted.', 'A creative order.'],
  orderNone: ['Not one in the right spot.', 'Shuffled, not sorted.'],
  roomSided: ['You read the room.', 'The room agrees with you.'],
  roomAlone: ['The room did not agree.', 'You stood alone on that one.'],
  bluffFound: ['You found the real one.', 'Not fooled.'],
  bluffFell: ['You fell for it.', 'Fooled. It happens.'],
} as const

type LineKey = keyof typeof LINES

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Pick a line that stays the same for this player and question on refresh. */
export function pickLine(key: LineKey, seed: string): string {
  const list = LINES[key]
  return list[hash(seed + key) % list.length]
}

export function quickTapLine(seed: string) {
  return pickLine('quickTap', seed)
}

export interface ResultLine {
  headline: string
  sub?: string
  tone: 'good' | 'bad' | 'neutral'
}

export function resultLine(
  type: QuestionType,
  r: PlayerResult | undefined,
  seed: string,
  opts: { timerMs: number; fellForNames?: string[] },
): ResultLine {
  if (!r || (!r.answered && !r.fooled)) {
    if (type === 'mostlikely') return { headline: 'No vote.', tone: 'neutral' }
    return { headline: pickLine('missed', seed), sub: r?.lostStreak ? pickLine('lostStreak', seed) : undefined, tone: 'bad' }
  }

  const lost = r.lostStreak ? pickLine('lostStreak', seed) : undefined

  switch (type) {
    case 'mostlikely':
      return r.points > 0
        ? { headline: pickLine('roomSided', seed), tone: 'good' }
        : { headline: pickLine('roomAlone', seed), tone: 'neutral' }

    case 'bluff': {
      const fooled = r.fooled ? `You fooled ${r.fooled} ${r.fooled === 1 ? 'player' : 'players'}.` : undefined
      if (r.correct) return { headline: pickLine('bluffFound', seed), sub: fooled, tone: 'good' }
      if (!r.answered) return { headline: fooled ?? 'No vote.', tone: r.fooled ? 'good' : 'neutral' }
      const who = opts.fellForNames?.length ? `That one was ${opts.fellForNames.join(' and ')}'s.` : 'That one was a house fake.'
      return { headline: pickLine('bluffFell', seed), sub: [who, fooled].filter(Boolean).join(' '), tone: r.fooled ? 'neutral' : 'bad' }
    }

    case 'closest':
      if (r.diff === 0) return { headline: pickLine('closeExact', seed), tone: 'good' }
      if (r.correct) return { headline: pickLine('closeGood', seed), tone: 'good' }
      if (r.points > 0) return { headline: pickLine('closeMid', seed), sub: lost, tone: 'neutral' }
      return { headline: pickLine('closeFar', seed), sub: lost, tone: 'bad' }

    case 'order':
      if (r.correct) return { headline: pickLine('orderFull', seed), sub: r.streak >= 3 ? pickLine('onStreak', seed) : undefined, tone: 'good' }
      return {
        headline: pickLine(r.positions ? 'orderPartial' : 'orderNone', seed),
        sub: lost,
        tone: r.positions ? 'neutral' : 'bad',
      }

    default: {
      if (r.correct) {
        const headline = r.tooFast ? pickLine('fastRight', seed) : pickLine('right', seed)
        return { headline, sub: r.streak >= 3 ? pickLine('onStreak', seed) : undefined, tone: 'good' }
      }
      const slow = r.timeMs != null && r.timeMs > opts.timerMs * 0.7
      const key: LineKey = r.tooFast ? 'fastWrong' : slow ? 'slowWrong' : 'wrong'
      return { headline: pickLine(key, seed), sub: lost, tone: 'bad' }
    }
  }
}
