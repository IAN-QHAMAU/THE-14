'use client'

import { AvatarDisplay } from '@/components/ui/Avatar'
import { TimerBar } from '@/components/ui/Countdown'
import { GetReady } from '@/components/game/GetReady'
import { GameIntro } from '@/components/game/GameIntro'
import { RevealBoard } from '@/components/game/RevealBoard'
import { Standings } from '@/components/game/Standings'
import { Podium } from '@/components/game/Podium'
import { ShareCard } from '@/components/game/ShareCard'
import { PromptExtras } from '@/components/game/answers'
import { CATEGORIES, GAME_TYPES } from '@/lib/game/questions/schema'
import { useState } from 'react'
import { useServerNow } from '@/lib/clock'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { GameStateResponse } from '@/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']

export function HostStage({ state, joinUrl }: { state: GameStateResponse; joinUrl: string }) {
  const { game, currentRound: round, currentQuestion: q } = state
  const now = useServerNow(200)
  // Big TV sizes on a laptop or TV, phone sizes when the host uses a phone.
  const size = useMediaQuery('(min-width: 768px)') ? 'stage' : 'phone'
  const players = state.players.filter((p) => !p.is_game_master)

  // ── Lobby ────────────────────────────────────────────────────────────────
  if (game.status === 'waiting') {
    return (
      <div className="text-center space-y-10 animate-fade-in">
        <div className="space-y-3">
          <p className="text-sm text-stone-400">
            Join at <span className="text-stone-200">{joinUrl}</span> with code
          </p>
          <p className="font-mono text-6xl md:text-8xl tracking-[0.2em] text-stone-50">{game.game_code}</p>
          <InviteLink code={game.game_code} />
        </div>
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto min-h-[5rem]">
          {players.length === 0 && <p className="text-stone-500">Waiting for players.</p>}
          {players.map((p, i) => (
            <div key={p.id} className="flex flex-col items-center gap-1.5 w-20 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <AvatarDisplay avatarId={p.avatar} size="lg" idle={p.is_connected} style={{ animationDelay: `${-i * 0.9}s` }} className={cn(!p.is_connected && 'opacity-40')} />
              <span className={cn('text-sm truncate max-w-full', p.is_connected ? 'text-stone-300' : 'text-stone-500')}>
                {p.name}
                {!p.is_connected && <span className="block text-[11px] text-stone-600">away</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (game.status === 'category') return <GameIntro game={game} size={size} />

  if (game.status === 'leaderboard') {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Standings
          scores={state.scores}
          lastReveal={state.lastReveal}
          size={size}
          limit={10}
          subtitle={`After question ${game.current_round} of ${game.total_questions}`}
        />
      </div>
    )
  }

  if (game.status === 'finished') {
    return (
      <Podium scores={state.scores} awards={state.awards} tags={state.tags} size={size}>
        <div className="max-w-xs mx-auto w-full space-y-2">
          <p className="text-xs tracking-widest uppercase text-stone-500 text-center">Group results card</p>
          <ShareCard mode="group" scores={state.scores} awards={state.awards} tags={state.tags} stats={state.stats} />
        </div>
      </Podium>
    )
  }

  if (!round || !q) {
    return <p className="text-stone-500">Loading question.</p>
  }

  const cat = CATEGORIES[q.category]
  const type = GAME_TYPES[q.type]
  const phase = round.data?.phase
  const isWrite = phase === 'write'
  const isVote = q.type === 'bluff' && !isWrite
  const spot = round.data?.sync
  const readyLabel =
    phase === 'wager' ? 'Final Wager'
    : round.data?.wager ? 'Final question'
    : isVote ? 'Voting time'
    : phase === 'pick' ? `${spot?.name ?? 'Someone'} goes first`
    : q.type === 'sync' ? 'Time to guess'
    : undefined

  // ── Reveal ───────────────────────────────────────────────────────────────
  if (game.status === 'question_result' && state.reveal) {
    const fastest = Object.entries(state.reveal.results)
      .filter(([, r]) => r.correct && r.timeMs != null)
      .sort((a, b) => a[1].timeMs! - b[1].timeMs!)[0]
    const fastestPlayer = fastest ? players.find((p) => p.id === fastest[0]) : null
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        <p className="text-2xl md:text-3xl font-light text-stone-100 leading-snug">{q.question}</p>
        <RevealBoard
          reveal={state.reveal}
          question={q}
          players={state.players}
          size={size}
          dark
          optionAvatars={round.data?.players?.map((p) => p.avatar)}
        />
        {fastestPlayer && !type.party && state.reveal.type !== 'closest' && (
          <p className="text-sm text-stone-400 flex items-center gap-2">
            <AvatarDisplay avatarId={fastestPlayer.avatar} size="xs" />
            Fastest correct: <span className="text-stone-200">{fastestPlayer.name}</span> in {(fastest![1].timeMs! / 1000).toFixed(1)}s
          </p>
        )}
      </div>
    )
  }

  // ── Get ready ────────────────────────────────────────────────────────────
  if (round.starts_at && now < Date.parse(round.starts_at)) {
    return (
      <GetReady
        question={q}
        number={round.round_number}
        total={game.total_questions}
        startsAt={round.starts_at}
        size={size}
        label={readyLabel}
      />
    )
  }

  // ── Live question ────────────────────────────────────────────────────────
  const answered = new Set(Object.entries(state.submissionStatus).filter(([, v]) => v).map(([k]) => k))

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-400">
        <span>
          {q.category === 'party' ? '🎉' : cat.emoji} {q.category === 'party' ? type.label : cat.label} · Question {round.round_number} of {game.total_questions}
        </span>
        <span>
          {isWrite ? 'Write a fake answer' : isVote ? 'Find the real answer' : phase === 'wager' ? 'Final Wager' : type.short}
        </span>
      </div>

      {round.starts_at && round.ends_at && <TimerBar startsAt={round.starts_at} endsAt={round.ends_at} dark ticking />}

      {spot && (
        <div className="flex items-center gap-4">
          <AvatarDisplay avatarId={spot.avatar} size="xl" idle />
          <p className="text-xl text-stone-300">{spot.name} goes first</p>
        </div>
      )}

      <h2 className="text-3xl md:text-5xl font-light text-stone-50 leading-tight">
        {phase === 'wager' ? `Last question. ${q.category === 'party' ? type.label : cat.label}.` : q.question}
      </h2>

      <PromptExtras question={q} startsAt={round.starts_at} endsAt={round.ends_at} size={size} />

      {phase === 'wager' ? (
        <p className="text-lg text-stone-400">Everyone is placing a bet before they see the question. Win it or lose it.</p>
      ) : phase === 'pick' ? (
        <p className="text-lg text-stone-400">{spot?.name ?? 'They'} is answering on their phone. Everyone else guesses next.</p>
      ) : isWrite ? (
        <p className="text-lg text-stone-400">Players are writing their fakes on their phones.</p>
      ) : q.type === 'closest' ? (
        <p className="text-lg text-stone-400">
          Guess between {q.min?.toLocaleString()} and {q.max?.toLocaleString()}
          {q.unit ? ` ${q.unit}` : ''}.
        </p>
      ) : q.type === 'mostlikely' ? (
        <div className="flex flex-wrap gap-4">
          {(round.data?.players ?? []).map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-1 w-20">
              <AvatarDisplay avatarId={p.avatar} size="lg" />
              <span className="text-sm text-stone-300 truncate max-w-full">{p.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={cn('grid gap-3', (q.options?.length ?? 0) === 2 ? 'grid-cols-2' : 'md:grid-cols-2')}>
          {(q.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl bg-stone-800 px-5 py-4">
              {q.type !== 'truefalse' && (
                <span className="w-9 h-9 rounded-xl bg-stone-700 text-stone-300 flex items-center justify-center text-sm font-semibold">
                  {q.type === 'order' ? '·' : LETTERS[i]}
                </span>
              )}
              <span className="text-xl text-stone-100">{opt}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {players.map((p) => (
            <AvatarDisplay
              key={p.id}
              avatarId={p.avatar}
              size="sm"
              className={cn('ring-2 ring-stone-900 transition-opacity', answered.has(p.id) ? 'opacity-100 motion-safe:animate-avatar-hop' : 'opacity-25')}
            />
          ))}
        </div>
        <span className="text-sm text-stone-400">
          {phase === 'pick'
            ? `Waiting for ${spot?.name ?? 'them'}`
            : `${state.answeredCount} of ${spot ? Math.max(1, players.length - 1) : players.length} ${isWrite ? 'written' : phase === 'wager' ? 'bets in' : 'answered'}`}
        </span>
      </div>
    </div>
  )
}

/** Join link with the code already filled in, ready to paste in the group chat. */
function InviteLink({ code }: { code: string }) {
  const [note, setNote] = useState('')
  const text = `Join my THE 14 game. Code ${code}`

  const link = () => `${window.location.origin}/join?code=${code}`

  async function copy() {
    try {
      const url = link()
      await navigator.clipboard.writeText(url)
      setNote('Link copied')
    } catch {
      setNote('Could not copy')
    }
  }

  async function share() {
    const url = link()
    try {
      if (navigator.share) {
        await navigator.share({ title: 'THE 14', text, url })
        return
      }
      await navigator.clipboard.writeText(`${text}: ${url}`)
      setNote('Invite copied')
    } catch {
      // Share sheet closed, nothing to do.
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <button type="button" onClick={copy} className="rounded-full border border-stone-700 px-4 py-1.5 text-sm text-stone-300 hover:bg-stone-800">
        Copy link
      </button>
      <button type="button" onClick={share} className="rounded-full bg-stone-100 px-4 py-1.5 text-sm text-stone-900 hover:bg-stone-200">
        Share invite
      </button>
      {note && <span className="text-xs text-stone-500 w-full">{note}</span>}
    </div>
  )
}
