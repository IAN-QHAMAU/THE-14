'use client'

import { AvatarDisplay } from '@/components/ui/Avatar'
import { PictureFrame } from '@/components/game/answers'
import { cn } from '@/lib/utils'
import type { Player, PublicQuestion, RevealPayload } from '@/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']

interface Props {
  reveal: RevealPayload
  question: PublicQuestion
  players: Pick<Player, 'id' | 'name' | 'avatar'>[]
  myPlayerId?: string
  myChoice?: number | null
  size?: 'phone' | 'stage'
  dark?: boolean
  /** Most Likely To: avatar for each option, in option order. */
  optionAvatars?: string[]
}

export function RevealBoard({ reveal, question, players, myPlayerId, myChoice, size = 'phone', dark = false, optionAvatars }: Props) {
  const byId = new Map(players.map((p) => [p.id, p]))
  const stage = size === 'stage'
  const muted = dark ? 'text-stone-400' : 'text-stone-500'
  const strong = dark ? 'text-stone-50' : 'text-stone-900'
  const track = dark ? 'bg-stone-800' : 'bg-stone-100'

  // ── Closest ─────────────────────────────────────────────────────────────
  if (reveal.type === 'closest') {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <p className={cn('text-xs uppercase tracking-widest', muted)}>The answer</p>
          <p className={cn('font-light tabular-nums', strong, stage ? 'text-7xl' : 'text-5xl')}>
            {reveal.answer_value?.toLocaleString()}
            {reveal.unit && <span className={cn('ml-2', muted, stage ? 'text-3xl' : 'text-xl')}>{reveal.unit}</span>}
          </p>
        </div>
        <ol className="space-y-1.5">
          {(reveal.guesses ?? []).slice(0, stage ? 8 : 6).map((g, i) => {
            const p = byId.get(g.player_id)
            return (
              <li
                key={g.player_id}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 animate-fade-up',
                  g.player_id === myPlayerId ? (dark ? 'bg-stone-700' : 'bg-stone-200') : track,
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className={cn('w-5 text-xs font-mono', muted)}>{i + 1}</span>
                {p && <AvatarDisplay avatarId={p.avatar} size="xs" />}
                <span className={cn('flex-1 truncate text-sm', strong)}>{p?.name ?? 'Player'}</span>
                <span className={cn('font-mono text-sm tabular-nums', strong)}>{g.value.toLocaleString()}</span>
                <span className={cn('font-mono text-xs w-16 text-right', muted)}>{g.diff === 0 ? 'exact' : `±${g.diff.toLocaleString()}`}</span>
              </li>
            )
          })}
        </ol>
        {!reveal.guesses?.length && <p className={cn('text-sm text-center', muted)}>No guesses this time.</p>}
      </div>
    )
  }

  // ── Order ───────────────────────────────────────────────────────────────
  if (reveal.type === 'order') {
    return (
      <div className="space-y-4">
        <p className={cn('text-xs uppercase tracking-widest', muted)}>Correct order</p>
        <ol className="space-y-1.5">
          {(reveal.correct_order ?? []).map((item, i) => (
            <li
              key={item}
              className={cn('flex items-center gap-3 rounded-xl px-4 py-3 animate-fade-up', dark ? 'bg-stone-50 text-stone-900' : 'bg-stone-900 text-stone-50')}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">{i + 1}</span>
              <span className={stage ? 'text-lg' : 'text-sm'}>{item}</span>
            </li>
          ))}
        </ol>
        <p className={cn('text-sm', muted)}>
          {reveal.fully_correct
            ? `${reveal.fully_correct} ${reveal.fully_correct === 1 ? 'player' : 'players'} got it perfect.`
            : 'Nobody got it perfect.'}
        </p>
      </div>
    )
  }

  // ── Option based: choice, true/false, emoji, picture, most likely, bluff ─
  const options = reveal.options.length ? reveal.options : question.options ?? []
  const isMostLikely = reveal.type === 'mostlikely' || reveal.type === 'wouldrather'
  const winners = reveal.correct_indices

  return (
    <div className="space-y-4">
      {reveal.type === 'picture' && question.image && <PictureFrame src={question.image} reveal size={size} />}
      {reveal.type === 'emoji' && question.emoji && (
        <p className={cn('text-center', stage ? 'text-7xl' : 'text-5xl')}>{question.emoji}</p>
      )}

      {reveal.sync_id && (
        <div className="flex items-center gap-3 animate-fade-up">
          {byId.get(reveal.sync_id) && (
            <AvatarDisplay avatarId={byId.get(reveal.sync_id)!.avatar} size={stage ? 'lg' : 'md'} mood={winners.length ? 'happy' : null} />
          )}
          <p className={cn(strong, stage ? 'text-xl' : 'text-base')}>
            {winners.length
              ? `${byId.get(reveal.sync_id)?.name ?? 'They'} picked ${options[winners[0]]}`
              : `${byId.get(reveal.sync_id)?.name ?? 'They'} did not answer in time`}
          </p>
        </div>
      )}

      {reveal.first_player_id && byId.get(reveal.first_player_id) && (
        <div className="flex items-center gap-3 animate-fade-up">
          <AvatarDisplay avatarId={byId.get(reveal.first_player_id)!.avatar} size={stage ? 'lg' : 'md'} mood="happy" />
          <p className={cn(strong, stage ? 'text-xl' : 'text-base')}>{byId.get(reveal.first_player_id)!.name} got there first</p>
        </div>
      )}

      {isMostLikely && winners.length > 0 && (
        <div className="flex flex-col items-center gap-2 py-2 animate-fade-up">
          <div className="flex -space-x-3">
            {winners.map((i) =>
              optionAvatars?.[i] ? (
                <AvatarDisplay key={i} avatarId={optionAvatars[i]} size={stage ? 'xl' : 'lg'} mood="happy" className="ring-4 ring-stone-900/5" />
              ) : null,
            )}
          </div>
          <p className={cn('text-center', strong, stage ? 'text-3xl font-light' : 'text-lg')}>
            {winners.map((i) => options[i]).join(' & ')}
          </p>
          <p className={cn('text-xs uppercase tracking-widest', muted)}>{reveal.type === 'wouldrather' ? 'The room would rather' : 'The room has spoken'}</p>
        </div>
      )}

      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          const stat = reveal.answer_stats.find((s) => s.optionIndex === idx)
          const pct = Math.max(0, Math.min(100, stat?.percentage ?? 0))
          const isRight = winners.includes(idx)
          const authors = reveal.option_authors?.[idx]
          const mine = myChoice === idx
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className={cn('min-w-0 flex items-center gap-2', isRight ? cn(strong, 'font-medium') : muted)}>
                  {!isMostLikely && <span className="text-xs font-mono opacity-60">{LETTERS[idx]}</span>}
                  <span className="truncate">{opt}</span>
                  {isRight && !isMostLikely && <span className="text-emerald-600 text-xs">✓</span>}
                  {mine && <span className={cn('text-[10px] uppercase tracking-wider rounded-full px-1.5 py-0.5', dark ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-600')}>You</span>}
                </span>
                <span className={cn('font-mono text-xs flex-shrink-0', muted)}>{stat?.count ?? 0}</span>
              </div>
              <div className={cn('h-2 w-full overflow-hidden rounded-full', track)}>
                <div
                  className={cn('h-full rounded-full origin-left animate-grow-x', isRight ? 'bg-emerald-600' : dark ? 'bg-stone-600' : 'bg-stone-300')}
                  style={{ width: `${pct}%`, animationDelay: `${idx * 90}ms` }}
                />
              </div>
              {reveal.type === 'bluff' && (
                <p className={cn('text-xs', muted)}>
                  {isRight
                    ? 'The real answer'
                    : authors?.length
                      ? `Fake by ${authors.map((a) => byId.get(a)?.name ?? 'someone').join(', ')}`
                      : 'House fake'}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {reveal.wager && (() => {
        const bets = Object.values(reveal.results).filter((r) => r.wager)
        if (!bets.length) return null
        const won = bets.filter((r) => r.correct).length
        return (
          <p className={cn(muted, stage ? 'text-lg' : 'text-sm')}>
            {won} of {bets.length} {bets.length === 1 ? 'bet' : 'bets'} won.
          </p>
        )
      })()}

      {reveal.explain && (
        <p className={cn('animate-fade-up', muted, stage ? 'text-lg' : 'text-sm')} style={{ animationDelay: `${options.length * 90 + 200}ms` }}>
          {reveal.explain}
        </p>
      )}
    </div>
  )
}
