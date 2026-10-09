
'use client'

import type { Player, Game } from '@/types'
import { AvatarDisplay } from '@/components/ui/Avatar'

interface Props {
  game: Game
  players: Player[]
  myPlayer: Player | null
}

export function WaitingRoom({ game, players, myPlayer }: Props) {
  const realPlayers = players.filter((player) => !player.is_game_master)
  const count = realPlayers.length
  const max = game.max_players
  const openSpots = Math.max(0, max - count)

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col px-6 py-10">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-10">

        <header>
          <h1 className="text-3xl font-light tracking-tight text-stone-900">
            THE 14
          </h1>
          <p className="mt-1 text-xs text-stone-400 tracking-widest uppercase">
            Waiting room
          </p>
        </header>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xs text-stone-400 tracking-widest uppercase">
              Players
            </h2>
            <span className="text-sm font-mono text-stone-600">
              {count} / {max}
            </span>
          </div>

          <div
            className="space-y-px"
            aria-label={`${count} of ${max} players joined`}
          >
            {realPlayers.map((player) => {
              const isMe = player.id === myPlayer?.id

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 py-3 px-4 border-l-2 ${
                    isMe
                      ? 'border-stone-900 bg-stone-100'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <AvatarDisplay avatarId={player.avatar} size="sm" />

                  <span className="text-sm text-stone-800 min-w-0 truncate">
                    {player.name}
                    {isMe && (
                      <span className="ml-2 text-xs text-stone-400">
                        (you)
                      </span>
                    )}
                  </span>

                  <span
                    className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      player.is_connected
                        ? 'bg-stone-900'
                        : 'bg-stone-300'
                    }`}
                    aria-label={
                      player.is_connected ? 'Connected' : 'Disconnected'
                    }
                    title={
                      player.is_connected ? 'Connected' : 'Disconnected'
                    }
                  />
                </div>
              )
            })}

            {Array.from({ length: openSpots }).map((_, index) => (
              <div
                key={`open-${index}`}
                className="flex items-center gap-3 py-3 px-4 border-l-2 border-stone-100 bg-white"
              >
                <span className="w-8 h-8 flex items-center justify-center text-xs text-stone-300 border border-stone-100">
                  {count + index + 1}
                </span>

                <span className="text-sm text-stone-300">
                  Open spot
                </span>
              </div>
            ))}
          </div>
        </section>

        <p className="text-sm text-stone-400">
          {count < 2
            ? 'Waiting for players.'
            : openSpots > 0
              ? `${openSpots} ${openSpots === 1 ? 'spot' : 'spots'} open.`
              : 'Room full.'}
        </p>

        <section className="border-t border-stone-200 pt-6">
          <p className="text-xs text-stone-400">Game code</p>

          <p className="text-2xl font-mono tracking-widest text-stone-700 mt-1">
            {game.game_code}
          </p>
        </section>
      </div>
    </main>
  )
}
