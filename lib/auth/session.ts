import { cookies } from 'next/headers'

export interface PlayerSession {
  playerId: string
  gameId: string
  isGameMaster: boolean
}

const COOKIE_NAME = 'the14_session'

export async function getSession(): Promise<PlayerSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

export function encodeSession(session: PlayerSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64')
}

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  }
}
