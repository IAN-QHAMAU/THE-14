'use client'
import { useState } from 'react'
import type { Round, RoundAssignment } from '@/types'
import { Button } from '@/components/ui/Button'
import { Countdown } from '@/components/ui/Countdown'

interface Props {
  round: Round
  assignment: RoundAssignment | null
  submitted: boolean
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

export function RoundActive({ round, assignment, submitted, onSubmit }: Props) {
  const [teamA, setTeamA] = useState(500)
  const [teamB, setTeamB] = useState(500)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSlider(val: number) {
    setTeamA(val)
    setTeamB(1000 - val)
  }

  async function handleSubmit() {
    if (teamA + teamB !== 1000) { setError('Must total 1000.'); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit({ teamA, teamB })
    } catch {
      setError('Submission failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col px-6 py-10">
      <div className="max-w-sm mx-auto w-full space-y-8 flex-1 flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400">
              Round {round.round_number}
            </p>
            <h2 className="text-xl font-medium text-stone-900 mt-0.5">{round.title}</h2>
          </div>
          {round.ends_at && <Countdown endsAt={round.ends_at} />}
        </div>

        {/* Description */}
        <div className="border-l-2 border-stone-200 pl-4">
          <p className="text-sm text-stone-600 leading-relaxed">{round.description}</p>
        </div>

        {/* Private instruction */}
        {assignment?.private_instruction && (
          <div className="bg-stone-900 text-stone-50 p-4 space-y-1">
            <p className="text-xs tracking-widest uppercase text-stone-400">Your Information</p>
            <p className="text-sm leading-relaxed">{assignment.private_instruction}</p>
          </div>
        )}

        {submitted ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-2xl">✓</p>
              <p className="text-sm font-medium text-stone-700">Decision locked.</p>
              <p className="text-xs text-stone-400">Waiting for others to submit.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-8">
            {/* Split control */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border border-stone-200 bg-white">
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Team A</p>
                  <p className="text-3xl font-light text-stone-900">{teamA}</p>
                </div>
                <div className="text-center p-4 border border-stone-200 bg-white">
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Team B</p>
                  <p className="text-3xl font-light text-stone-900">{teamB}</p>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={10}
                  value={teamA}
                  onChange={(e) => handleSlider(Number(e.target.value))}
                  className="w-full accent-stone-900 h-1"
                />
                <div className="flex justify-between text-xs text-stone-400">
                  <span>All to A</span>
                  <span>All to B</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button size="lg" onClick={handleSubmit} loading={loading}>
                SUBMIT DECISION
              </Button>
              <p className="text-xs text-stone-400 text-center">
                You cannot change your decision after submitting.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
