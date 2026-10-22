'use client'

import { useEffect, useRef } from 'react'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { RevealBoard } from '@/components/game/RevealBoard'
import { ReactionBar } from '@/components/game/Reactions'
import { resultLine } from '@/lib/game/lines'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'
import type { GameStateResponse } from '@/types'

interface Props {
  state: GameStateResponse
  onReact: (emoji: string) => void
}

export function QuestionResult({ state, onReact }: Props) {
  const { reveal, currentQuestion: q, myPlayer, currentRound: round, game } = state
  const me = myPlayer?.id ?? ''
  const r = reveal?.results[me]
  const played = useRef<string | null>(null)

  const timerMs = (game.settings?.timer ?? 20) * 1000
  const names = (ids?: string[]) => (ids ?? []).map((id) => state.players.find((p) => p.id === id)?.name ?? 'someone')
  const answered = reveal ? Object.values(reveal.results).filter((x) => x.answered) : []
  const line =
    reveal && q
      ? resultLine(reveal.type, r, `${me}:${q.id}`, {
          timerMs,
          fellForNames: names(r?.fellFor),
          answered: answered.length,
          roomRight: answered.length ? answered.filter((x) => x.correct).length / answered.length : undefined,
          rankBefore: reveal.rank_before[me],
          players: Object.keys(reveal.rank_before).length,
          // Ties (like everyone on 0 at the start) make no one the leader.
          soleRank: Object.values(reveal.rank_before).filter((x) => x === reveal.rank_before[me]).length === 1,
        })
      : null

  useEffect(() => {
    if (!line || !round || played.current === round.id) return
    played.current = round.id
    if (line.tone === 'good') sound.correct()
    else if (line.tone === 'bad') sound.wrong()
    else sound.reveal()
  }, [line, round])

  if (!reveal || !q || !line) return null

  const before = reveal.rank_before[me]
  const after = reveal.rank_after[me] ?? state.myRank
  const moved = before && after ? before - after : 0
  const totalPlayers = state.players.filter((p) => !p.is_game_master).length

  return (
    <main className="min-h-[100dvh] bg-stone-50 flex flex-col px-4 pt-6 pb-8">
      <div className="max-w-md mx-auto w-full space-y-6">
        <section
          className={cn(
            'rounded-2xl p-5 flex items-center gap-4 animate-fade-up',
            line.tone === 'good' ? 'bg-emerald-50 text-emerald-950' : line.tone === 'bad' ? 'bg-rose-50 text-rose-950' : 'bg-stone-100 text-stone-800',
          )}
        >
          {myPlayer && <AvatarDisplay avatarId={myPlayer.avatar} size="lg" mood={line.tone === 'good' ? 'happy' : line.tone === 'bad' ? 'sad' : null} />}
          <div className="min-w-0 flex-1">
            <p className="text-lg font-medium leading-snug">{line.headline}</p>
            {line.sub && <p className="text-sm opacity-70 mt-0.5">{line.sub}</p>}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs opacity-80">
              <span className="font-mono">{r && r.points < 0 ? `${r.points}` : `+${r?.points ?? 0}`}</span>
              {r?.streakBonus ? <span>🔥 {r.streak} in a row, +{r.streakBonus}</span> : null}
              {r?.tooFast && r.correct === false ? <span>Too fast</span> : null}
              {r?.timeMs != null && reveal.type !== 'mostlikely' && reveal.type !== 'wouldrather' && reveal.type !== 'bluff' && reveal.type !== 'sync' ? <span>{(r.timeMs / 1000).toFixed(1)}s</span> : null}
            </div>
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: '250ms' }}>
          <p className="text-sm text-stone-500 mb-3">{q.question}</p>
          <RevealBoard
            reveal={reveal}
            question={q}
            players={state.players}
            myPlayerId={me}
            myChoice={state.myAnswer?.option_index ?? null}
            optionAvatars={round?.data?.players?.map((p) => p.avatar)}
          />
        </section>

        <section className="flex items-center justify-between border-t border-stone-200 pt-4 animate-fade-up" style={{ animationDelay: '500ms' }}>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest">Score</p>
            <p className="text-2xl font-light text-stone-900 tabular-nums">{state.myScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Rank</p>
            <p className="text-2xl font-light text-stone-900">
              {after}
              <span className="text-sm text-stone-400"> / {totalPlayers}</span>
              {moved !== 0 && (
                <span className={cn('ml-2 text-sm', moved > 0 ? 'text-emerald-600' : 'text-rose-500')}>
                  {moved > 0 ? `▲${moved}` : `▼${-moved}`}
                </span>
              )}
            </p>
          </div>
        </section>

        <ReactionBar onSend={onReact} />
        <p className="text-xs text-stone-400 text-center">Waiting for the host.</p>
      </div>
    </main>
  )
}
