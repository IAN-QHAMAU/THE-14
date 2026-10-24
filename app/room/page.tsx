'use client'
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/lib/hooks/useGameState'
import { WaitingRoom } from '@/components/game/WaitingRoom'
import { GameIntro } from '@/components/game/GameIntro'
import { QuestionScreen, type SubmitBody } from '@/components/game/QuestionScreen'
import { QuestionResult } from '@/components/game/QuestionResult'
import { Standings } from '@/components/game/Standings'
import { Podium } from '@/components/game/Podium'
import { ResultCards } from '@/components/game/ShareCard'
import { battleOf } from '@/lib/game/teams'
import { TeamFinale, TeamStandings } from '@/components/game/Teams'
import { PowerHand, PowerToast } from '@/components/game/Powers'
import { ReactionBar, ReactionLayer, useReactions } from '@/components/game/Reactions'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { VoiceFab } from '@/components/voice/Voice'
import { VoiceProvider, isQuestionLive } from '@/lib/voice/VoiceProvider'
import { useServerNow } from '@/lib/clock'

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

  const me = useMemo(
    () => (state?.myPlayer ? { id: state.myPlayer.id, name: state.myPlayer.name } : undefined),
    [state?.myPlayer],
  )
  const { items, send } = useReactions(state?.game.id, me)
  const now = useServerNow(500)

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

  const voiceMe = state.myPlayer ? { id: state.myPlayer.id, name: state.myPlayer.name, avatar: state.myPlayer.avatar } : null
  const voiceQuiet = state.game.settings?.voiceQuiet !== false
  const questionLive = isQuestionLive(state.game, state.currentRound, now)

  const screen = (): React.ReactNode => {
    const { game, myPlayer } = state

    if (game.status === 'waiting') {
      return <WaitingRoom game={game} players={state.players} myPlayer={myPlayer} teams={state.teams} teamMeta={state.teamMeta} />
    }

    // The host closed this lobby before it started (usually for a new game).
    if (game.status === 'finished' && game.total_questions === 0) {
      return (
        <Dark>
          <div className="text-center space-y-4 animate-fade-up">
            <h1 className="text-2xl font-light">The host started a new game</h1>
            <p className="text-sm text-stone-400">Ask the host for the new code, or open their invite link.</p>
            <button
              type="button"
              onClick={toJoin}
              className="mt-2 rounded-xl bg-stone-50 text-stone-900 px-6 py-3 text-sm font-medium"
            >
              Join a game
            </button>
          </div>
        </Dark>
      )
    }

    if (game.status === 'finished') {
      const meEntry = state.scores.find((s) => s.player_id === myPlayer?.id)
      return (
        <Dark>
          <ReactionLayer items={items} />
          <Podium
            scores={state.scores}
            awards={state.awards}
            tags={state.tags}
            myPlayerId={myPlayer?.id}
            hero={game.settings?.teams ? <TeamFinale scores={state.scores} teams={state.teams} meta={state.teamMeta} myId={myPlayer?.id} /> : undefined}
          >
            <div className="space-y-6">
              <ReactionBar onSend={send} dark />
              {meEntry && (
                <ResultCards
                  mode="player"
                  me={meEntry}
                  scores={state.scores}
                  awards={state.awards}
                  tags={state.tags}
                  stats={state.stats}
                  battle={game.settings?.teams ? battleOf(state.scores, state.teams, state.teamMeta) : undefined}
                />
              )}
              <button type="button" onClick={toJoin} className="w-full text-xs text-stone-500 underline underline-offset-4 hover:text-stone-300">
                Join another game
              </button>
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
            {game.settings?.teams ? (
              <TeamStandings
                scores={state.scores}
                teams={state.teams}
                meta={state.teamMeta}
                myId={myPlayer?.id}
                subtitle={`After question ${game.current_round} of ${game.total_questions}.`}
              />
            ) : (
              <Standings
                scores={state.scores}
                lastReveal={state.lastReveal}
                myPlayerId={myPlayer?.id}
                subtitle={`After question ${game.current_round} of ${game.total_questions}`}
              />
            )}
            <PowerHand state={state} dark />
            <ReactionBar onSend={send} dark />
          </div>
        </Dark>
      )
    }

    if (game.status === 'active' && state.currentRound && state.currentQuestion) {
      // A fresh screen for every question and every Bluff phase, so nothing
      // from the previous one (like a selected answer) can carry over.
      const phaseKey = `${state.currentRound.id}:${state.currentRound.data?.phase ?? 'answer'}`
      return <QuestionScreen key={phaseKey} state={state} onSubmit={handleSubmit} />
    }

    if (game.status === 'category') {
      return (
        <Dark>
          <div className="space-y-8">
            <GameIntro game={game} />
            <PowerHand state={state} dark />
          </div>
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

  return (
    <VoiceProvider
      gameId={state.game.id}
      me={voiceMe}
      quiet={voiceQuiet && questionLive}
      quietDuringQuestions={voiceQuiet}
      callLink={state.game.settings?.callLink}
    >
      {screen()}
      {state.game.settings?.powerUps && <PowerToast feed={state.powerFeed} />}
      <VoiceFab />
    </VoiceProvider>
  )
}
