'use client'
import type { Player, Game } from '@/types'

interface Props {
  game: Game
  players: Player[]
  myPlayer: Player | null
}

export function WaitingRoom({ game, players, myPlayer }: Props) {
  const realPlayers = players.filter((p) => !p.is_game_master)
  const count = realPlayers.length
  const max = game.max_players

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col px-6 py-12">
      <div className="max-w-sm mx-auto w-full space-y-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-stone-900">THE 14</h1>
          <p className="mt-1 text-xs text-stone-400 tracking-widest uppercase">Waiting room</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs text-stone-400 tracking-widest uppercase">Players joined</span>
            <span className="text-sm font-mono text-stone-600">
              {count} / {max}
            </span>
          </div>

          <div className="space-y-px">
            {realPlayers.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 py-3 px-4 border-l-2 ${
                  p.id === myPlayer?.id
                    ? 'border-stone-900 bg-stone-100'
                    : 'border-stone-200 bg-white'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    p.is_connected ? 'bg-stone-900' : 'bg-stone-300'
                  }`}
                />
                <span className="text-sm text-stone-800">
                  {p.name}
                  {p.id === myPlayer?.id && (
                    <span className="ml-2 text-xs text-stone-400">(you)</span>
                  )}
                </span>
              </div>
            ))}

            {Array.from({ length: Math.max(0, max - count) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 py-3 px-4 border-l-2 border-stone-100 bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-100 flex-shrink-0" />
                <span className="text-sm text-stone-300">—</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-stone-400">
          {count < max
            ? `Waiting for ${max - count} more player${max - count !== 1 ? 's' : ''} to join.`
            : 'All players have joined. Waiting for the game to begin.'}
        </p>

        <div className="border-t border-stone-100 pt-6">
          <p className="text-xs text-stone-300">Game code</p>
          <p className="text-2xl font-mono tracking-widest text-stone-700 mt-1">{game.game_code}</p>
        </div>
      </div>
    </main>
  )
}
