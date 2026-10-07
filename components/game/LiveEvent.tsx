'use client'
import { useEffect, useState } from 'react'
import type { GameEvent } from '@/types'
import { Button } from '@/components/ui/Button'

interface Props {
  event: GameEvent | null
}

export function LiveEvent({ event }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (event?.event_type === 'secret_action') {
      setVisible(true)
    }
  }, [event])

  if (!visible || !event) return null

  const payload = event.payload as { message?: string }

  return (
    <div className="fixed inset-0 bg-stone-900/80 z-50 flex items-center justify-center px-6">
      <div className="bg-stone-50 max-w-sm w-full p-8 space-y-6">
        <div>
          <p className="text-xs tracking-widest uppercase text-red-600 mb-2">Important</p>
          <p className="text-sm text-stone-700 leading-relaxed">
            {payload.message ?? 'An unexpected event has occurred. The group must respond.'}
          </p>
        </div>
        <Button size="lg" onClick={() => setVisible(false)}>
          CONTINUE
        </Button>
      </div>
    </div>
  )
}
