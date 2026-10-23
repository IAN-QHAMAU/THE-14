'use client'

import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, GAME_TYPES, GROUP_TINT } from '@/lib/game/questions/schema'
import { TimerBar } from '@/components/ui/Countdown'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { GetReady } from '@/components/game/GetReady'
import { BluffWrite, ClosestInput, OptionPad, OrderPicker, PicturePad, PlayerVote, PromptExtras, SyncPick, SyncWait, WagerInput } from '@/components/game/answers'
import { serverNow, useServerNow } from '@/lib/clock'
import { quickTapLine } from '@/lib/game/lines'
import { FADING_TYPES, FULL_POINTS_MS, fadeFactor, maxWager } from '@/lib/game/scoring'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'
import type { GameStateResponse } from '@/types'

export interface SubmitBody {
  optionIndex?: number
  value?: number
  order?: number[]
  text?: string
}

interface Props {
  state: GameStateResponse
  onSubmit: (body: SubmitBody) => Promise<{ tooFast?: boolean; error?: string }>
}

/**
 * Answers ignore taps for this long after they appear. Players often tap
 * during the countdown, and without this the browser would deliver that tap
 * to whichever answer button appears under their finger.
 */
const ARM_DELAY_MS = 500

export function QuestionScreen({ state, onSubmit }: Props) {
  const { currentRound: round, currentQuestion: q, game, myPlayer } = state
  const now = useServerNow(200)
  const [pending, setPending] = useState<SubmitBody | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // When the latest finger or mouse press started. A tap only counts if it
  // started after the answers were ready.
  const pressedAt = useRef<number | null>(null)
  const onPress = () => {
    pressedAt.current = serverNow()
  }

  const phase = round?.data?.phase ?? 'vote'
  const phaseKey = `${round?.id}:${phase}`

  useEffect(() => {
    setPending(null)
    setBusy(false)
    setNote(null)
    setError(null)
  }, [phaseKey])

  if (!round || !q || !round.starts_at || !round.ends_at) return null

  const startsAt = Date.parse(round.starts_at)
  const endsAt = Date.parse(round.ends_at)
  const isVote = q.type === 'bluff' && phase === 'vote'
  const spot = round.data?.sync
  const amSpot = Boolean(spot && spot.id === myPlayer?.id)
  const wagerRound = Boolean(round.data?.wager)
  const readyLabel =
    phase === 'wager' ? 'Final Wager'
    : wagerRound ? 'Final question'
    : isVote ? 'Voting time'
    : phase === 'pick' ? (amSpot ? 'You go first' : `${spot?.name ?? 'Someone'} goes first`)
    : q.type === 'sync' ? 'Your turn to guess'
    : undefined

  if (now < startsAt) {
    return (
      <main onPointerDownCapture={onPress} className="min-h-[100dvh] bg-stone-900 text-stone-50 flex items-center justify-center px-6">
        <GetReady
          question={q}
          number={round.round_number}
          total={game.total_questions}
          startsAt={round.starts_at}
          label={readyLabel}
        />
      </main>
    )
  }

  const timeUp = now > endsAt
  const serverAnswer = state.myAnswer
  const done =
    phase === 'write' ? Boolean(state.myBluff)
    : phase === 'wager' ? state.myWager !== null || pending !== null
    : phase === 'pick' ? !amSpot || state.myPick !== null || pending !== null
    : q.type === 'sync' && amSpot ? true
    : Boolean(serverAnswer) || pending !== null
  const armedAt = startsAt + ARM_DELAY_MS
  const armed = now >= armedAt
  // Bets stay open to changes until time runs out.
  const locked = phase === 'wager' ? timeUp || busy : done || timeUp || busy
  const cat = CATEGORIES[q.category]
  const type = GAME_TYPES[q.type]

  async function submit(body: SubmitBody) {
    if (locked) return
    // Ignore a tap that began before the answers were ready (a carried over
    // countdown tap). Keyboard presses have no pointer press and still work.
    const pressed = pressedAt.current
    if (serverNow() < armedAt || (pressed !== null && pressed < armedAt)) return
    sound.unlock()
    sound.tap()
    setPending(body)
    setBusy(true)
    setError(null)
    const res = await onSubmit(body)
    setBusy(false)
    if (res.error) {
      setPending(null)
      setError(res.error)
      return
    }
    if (res.tooFast) setNote(quickTapLine(`${myPlayer?.id}:${q?.id}`))
  }

  const selectedIndex = pending?.optionIndex ?? (phase === 'pick' ? state.myPick : serverAnswer?.option_index) ?? null

  // The bluffer's own fake is shown but cannot be picked.
  const ownIndex =
    isVote && state.myBluff
      ? (q.options ?? []).findIndex((o) => o.trim().toLowerCase() === state.myBluff!.trim().toLowerCase())
      : null

  let body: React.ReactNode
  if (phase === 'wager') {
    const score = state.myScore
    body = (
      <WagerInput
        score={score}
        max={maxWager(score)}
        disabled={locked}
        submitted={pending?.value ?? state.myWager}
        onSubmit={(value) => submit({ value })}
      />
    )
  } else if (q.type === 'sync' && phase === 'pick' && amSpot) {
    body = (
      <SyncPick
        options={q.options ?? []}
        selected={selectedIndex !== null && selectedIndex >= 0 ? selectedIndex : null}
        written={pending?.text ?? state.myPickText}
        disabled={locked}
        onPick={(optionIndex) => submit({ optionIndex })}
        onWrite={(text) => submit({ text })}
      />
    )
  } else if (q.type === 'sync' && phase === 'pick' && !amSpot) {
    body = <SyncWait avatar={spot?.avatar} title={`${spot?.name ?? 'Someone'} is answering`} text="Get ready. Your turn is next." />
  } else if (q.type === 'sync' && phase === 'vote' && amSpot) {
    body = <SyncWait avatar={spot?.avatar} title="Your answer is in" text="Now everyone is guessing what you picked." />
  } else if (q.type === 'bluff' && phase === 'write') {
    body = <BluffWrite disabled={timeUp || busy} submitted={state.myBluff} onSubmit={(text) => submit({ text })} />
  } else if (q.type === 'oddone') {
    body = <PicturePad pics={q.options ?? []} selected={selectedIndex} disabled={locked} onPick={(optionIndex) => submit({ optionIndex })} />
  } else if (q.type === 'mostlikely') {
    body = (
      <PlayerVote
        players={round.data?.players ?? []}
        selected={selectedIndex}
        disabled={locked}
        onPick={(optionIndex) => submit({ optionIndex })}
      />
    )
  } else if (q.type === 'closest') {
    body = (
      <ClosestInput
        question={q}
        disabled={locked}
        submitted={pending?.value ?? serverAnswer?.value ?? null}
        onSubmit={(value) => submit({ value })}
      />
    )
  } else if (q.type === 'order') {
    body = (
      <OrderPicker
        items={q.options ?? []}
        disabled={locked}
        submitted={pending?.order ?? serverAnswer?.order ?? null}
        onSubmit={(order) => submit({ order })}
      />
    )
  } else {
    body = (
      <OptionPad
        options={q.options ?? []}
        selected={selectedIndex}
        disabled={locked}
        disabledIndex={ownIndex !== null && ownIndex >= 0 ? ownIndex : null}
        onPick={(optionIndex) => submit({ optionIndex })}
      />
    )
  }

  const totalPlayers = state.players.filter((p) => !p.is_game_master).length
  const status = error
    ? error
    : note
      ? note
      : done
        ? phase === 'write' ? 'Fake submitted.' : phase === 'wager' ? 'Bet placed. You can change it until time runs out.' : q.type === 'sync' && (amSpot || phase === 'pick') ? null : 'Locked in.'
        : timeUp
          ? 'Time is up.'
          : null

  return (
    <main onPointerDownCapture={onPress} className="min-h-[100dvh] bg-stone-50 flex flex-col px-4 pt-6 pb-8 safe-top">
      <div className="max-w-md mx-auto w-full flex flex-col gap-5 flex-1">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{q.category === 'party' ? '🎉' : cat.emoji}</span>
            {cat.group && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GROUP_TINT[cat.group] }} />}
            <span className="text-xs text-stone-400 tracking-widest uppercase truncate">
              {round.round_number} / {game.total_questions} · {phase === 'wager' ? 'Final Wager' : isVote ? 'Find the real answer' : type.short}
            </span>
          </div>
          <SoundToggle />
        </header>

        <TimerBar startsAt={round.starts_at} endsAt={round.ends_at} ticking={!done} />
        {FADING_TYPES.includes(q.type) && phase !== 'wager' && !done && !timeUp && (
          // What a right answer is worth right now. Points start fading after a few seconds.
          <p className="-mt-3 flex justify-between text-xs text-stone-400 tabular-nums">
            <span>{now - startsAt < FULL_POINTS_MS ? 'Full points' : 'Points fading'}</span>
            <span>
              Worth{' '}
              <span className="text-stone-700 font-medium">
                {Math.round((q.type === 'fastest' ? q.points * 2 : q.points) * fadeFactor(Math.max(0, now - startsAt), endsAt - startsAt))}
              </span>
            </span>
          </p>
        )}

        <div className="animate-fade-up space-y-3">
          <h2 className="text-xl font-medium text-stone-900 leading-snug">
            {phase === 'wager'
              ? `Last question: ${q.category === 'party' ? type.label : cat.label}. How much will you bet?`
              : phase === 'pick' && amSpot
                ? q.self
                : q.question}
          </h2>
          <PromptExtras question={q} startsAt={round.starts_at} endsAt={round.ends_at} />
        </div>

        <div className={cn('flex-1 transition-opacity duration-300', armed ? 'opacity-100' : 'opacity-40 pointer-events-none')} aria-busy={!armed}>
          {body}
        </div>

        <footer className="text-center space-y-1 min-h-[2.5rem]" aria-live="polite">
          {status && (
            <p key={status} className={cn('text-sm animate-fade-up', error ? 'text-rose-600 animate-nudge' : 'text-stone-500')}>
              {status}
            </p>
          )}
          {phase !== 'pick' && (
            <p className="text-xs text-stone-400">
              {state.answeredCount} of {q.type === 'sync' ? Math.max(1, totalPlayers - 1) : totalPlayers}{' '}
              {phase === 'write' ? 'written' : phase === 'wager' ? 'bets in' : 'answered'}
            </p>
          )}
        </footer>
      </div>
    </main>
  )
}
