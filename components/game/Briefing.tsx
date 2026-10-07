'use client'
import { useState } from 'react'
import type { PlayerRole } from '@/types'
import { Button } from '@/components/ui/Button'

interface Props {
  role: PlayerRole
  onReady: () => void
}

export function Briefing({ role, onReady }: Props) {
  const [revealed, setRevealed] = useState(false)

  return (
    <main className="min-h-screen bg-stone-900 text-stone-50 flex flex-col px-6 py-12">
      <div className="max-w-sm mx-auto w-full space-y-10 flex-1 flex flex-col justify-center">
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-500 mb-1">Confidential</p>
          <h1 className="text-3xl font-light">Your Briefing</h1>
        </div>

        {!revealed ? (
          <div className="space-y-6">
            <p className="text-stone-400 text-sm leading-relaxed">
              You are about to receive private information. Keep this screen private.
              Do not show it to other players.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="border-stone-700 text-stone-300 hover:bg-stone-800"
              onClick={() => setRevealed(true)}
            >
              SHOW MY BRIEFING
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-xs tracking-widest uppercase text-stone-500">Your Role</p>
              <p className="text-lg font-medium text-stone-100">{role.role_name}</p>
            </div>

            <div className="space-y-2 border-l-2 border-stone-700 pl-4">
              <p className="text-xs tracking-widest uppercase text-stone-500">Your Objective</p>
              <p className="text-sm text-stone-200 leading-relaxed">{role.secret_objective}</p>
            </div>

            <div className="space-y-2 border-l-2 border-stone-700 pl-4">
              <p className="text-xs tracking-widest uppercase text-stone-500">Private Information</p>
              <p className="text-sm text-stone-300 leading-relaxed">{role.private_information}</p>
            </div>

            {role.special_ability && (
              <div className="space-y-2 border-l-2 border-stone-600 pl-4">
                <p className="text-xs tracking-widest uppercase text-stone-500">Special Ability</p>
                <p className="text-sm text-stone-300 leading-relaxed">{role.special_ability}</p>
              </div>
            )}

            <div className="pt-2">
              <p className="text-xs text-stone-600 mb-4">
                Keep this information private. Other players must not see your objective.
              </p>
              <Button
                size="lg"
                className="bg-stone-50 text-stone-900 hover:bg-stone-200 w-full"
                onClick={onReady}
              >
                I'M READY
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
