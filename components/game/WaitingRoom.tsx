'use client'

import type { Player, Game } from '@/types'
import { AvatarDisplay } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

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
    <main className="min-h-[100dvh] bg-stone-50 flex flex-col px-6 py-10">
      <div className="max-w-md mx-auto w-full flex flex-col gap-10">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-stone-900">THE 14</h1>
            <p className="mt-1 text-xs text-stone-400 tracking-widest uppercase">Lobby</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400">Game code</p>
            <p className="text-xl font-mono tracking-widest text-stone-700">{game.game_code}</p>
          </div>
        </header>

        {myPlayer && (
          <section className="flex items-center gap-4 rounded-2xl bg-white border border-stone-200 p-4 animate-fade-up">
            <AvatarDisplay avatarId={myPlayer.avatar} size="lg" mood="happy" />
            <div>
              <p className="text-lg text-stone-900">{myPlayer.name}</p>
              <p className="text-sm text-stone-400">You are in. The host will start soon.</p>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xs text-stone-400 tracking-widest uppercase">Players</h2>
            <span className="text-sm font-mono text-stone-500">
              {count} / {max}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3" aria-label={`${count} of ${max} players joined`}>
            {realPlayers.map((player, i) => (
              <div key={player.id} className="flex flex-col items-center gap-1.5 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <AvatarDisplay
                  avatarId={player.avatar}
                  size="md"
                  className={cn(player.id === myPlayer?.id && 'ring-2 ring-stone-900 ring-offset-2 ring-offset-stone-50', !player.is_connected && 'opacity-40')}
                />
                <span className="text-xs text-stone-600 truncate max-w-full">{player.name}</span>
              </div>
            ))}
            {Array.from({ length: openSpots }).map((_, index) => (
              <div key={`open-${index}`} className="flex flex-col items-center gap-1.5">
                <span className="w-12 h-12 rounded-full border border-dashed border-stone-200" />
                <span className="text-xs text-stone-300">Open</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
