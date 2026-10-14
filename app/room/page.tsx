'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/lib/hooks/useGameState'
import { WaitingRoom } from '@/components/game/WaitingRoom'
import { GameIntro } from '@/components/game/GameIntro'
import { QuestionScreen, type SubmitBody } from '@/components/game/QuestionScreen'
import { QuestionResult } from '@/components/game/QuestionResult'
import { Standings } from '@/components/game/Standings'
import { Podium, shareResult } from '@/components/game/Podium'
import { ReactionBar, ReactionLayer, useReactions } from '@/components/game/Reactions'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { Button } from '@/components/ui/Button'

function Dark({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-[100dvh] bg-stone-900 text-stone-50 flex flex-col px-4 py-10">
      <div className="absolute top-4 right-4">
        <SoundToggle dark />
      </div>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">{children}</div>
    </main>
  )
}

export default function RoomPage() {
  const router = useRouter()
  const toJoin = useCallback(() => router.push('/join'), [router])
  const { state, error, refresh } = useGameState({ onUnauthorized: toJoin })
  const [shareNote, setShareNote] = useState('')

  const me = useMemo(
    () => (state?.myPlayer ? { id: state.myPlayer.id, name: state.myPlayer.name } : undefined),
    [state?.myPlayer],
  )
  const { items, send } = useReactions(state?.game.id, me)

  async function handleSubmit(body: SubmitBody) {
    try {
      const res = await fetch('/api/action/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error ?? 'Could not submit.' }
      void refresh()
      return { tooFast: Boolean(data.tooFast) }
    } catch {
      return { error: 'Connection problem. Try again.' }
    }
  }

  if (!state) {
    return (
      <main className="min-h-[100dvh] bg-stone-50 flex items-center justify-center px-6">
        {error ? (
          <div className="text-center space-y-4">
            <p className="text-stone-600">{error}</p>
            <button onClick={toJoin} className="text-sm underline text-stone-500">
              Back to join
            </button>
          </div>
        ) : (
          <p className="text-xs text-stone-400 tracking-widest uppercase animate-pulse">Loading</p>
        )}
      </main>
    )
  }

  if (state.isGameMaster) {
    router.push('/gm/control')
    return null
  }

  const { game, myPlayer } = state

  if (game.status === 'waiting') {
    return <WaitingRoom game={game} players={state.players} myPlayer={myPlayer} />
  }

  if (game.status === 'finished') {
    const summary = `THE 14: I finished ${state.myRank} of ${state.scores.length} with ${state.myScore} points.`
    return (
      <Dark>
        <ReactionLayer items={items} />
        <Podium scores={state.scores} awards={state.awards} myPlayerId={myPlayer?.id}>
          <div className="space-y-4">
            <ReactionBar onSend={send} dark />
            <Button
              variant="secondary"
              className="w-full bg-transparent border-stone-700 text-stone-300 hover:bg-stone-800"
              onClick={async () => {
                const r = await shareResult(summary)
                setShareNote(r === 'copied' ? 'Copied.' : r === 'failed' ? 'Could not share.' : '')
              }}
            >
              Share result
            </Button>
            {shareNote && <p className="text-xs text-center text-stone-500">{shareNote}</p>}
          </div>
        </Podium>
      </Dark>
    )
  }

  if (game.status === 'question_result' && state.reveal) {
    return (
      <>
        <ReactionLayer items={items} />
        <QuestionResult state={state} onReact={send} />
      </>
    )
  }

  if (game.status === 'leaderboard') {
    return (
      <Dark>
        <ReactionLayer items={items} />
        <div className="space-y-8">
          <Standings
            scores={state.scores}
            lastReveal={state.lastReveal}
            myPlayerId={myPlayer?.id}
            subtitle={`After question ${game.current_round} of ${game.total_questions}`}
          />
          <ReactionBar onSend={send} dark />
        </div>
      </Dark>
    )
  }

  if (game.status === 'active' && state.currentRound && state.currentQuestion) {
    return <QuestionScreen state={state} onSubmit={handleSubmit} />
  }

  if (game.status === 'category') {
    return (
      <Dark>
        <GameIntro game={game} />
      </Dark>
    )
  }

  // Brief in-between moments while the next screen loads.
  return (
    <Dark>
      <p className="text-center text-sm text-stone-500 animate-pulse">One moment.</p>
    </Dark>
  )
}
