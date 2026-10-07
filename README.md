# THE 14

> Fourteen people. One game.

A real-time multiplayer social strategy game for 14 players on mobile, plus one Game Master. Players receive hidden roles, secret objectives, and asymmetric information. Across timed rounds they vote, deceive, and influence a shared outcome.

---

## Quick Start

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. In **Project Settings → API**, copy your project URL and keys

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Enable Realtime

In your Supabase dashboard → **Database → Replication**, enable the `supabase_realtime` publication for:
- `games`
- `players`
- `rounds`
- `events`
- `actions`

(The schema.sql attempts this automatically, but verify in the dashboard.)

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to Play

### Game Master

1. Go to `/gm` → **Create New Game**
2. Share the 5-letter game code with your 14 players
3. Go to `/gm/control` to monitor and run the game
4. Use the control panel to start rounds, reveal results, and trigger events

### Players

1. Go to `/join` on their phone
2. Enter the game code and their name
3. Wait in the lobby until the GM starts
4. Read their private briefing (keep it secret)
5. Submit decisions each round before time runs out

---

## Project Structure

```
the14/
├── app/
│   ├── join/           # Player join page
│   ├── room/           # Main player game view
│   ├── gm/             # GM create page
│   │   └── control/    # GM control panel
│   └── api/
│       ├── game/       # join, create, state endpoints
│       ├── round/      # GM control endpoint
│       └── action/     # Player submit endpoint
├── components/
│   ├── game/           # WaitingRoom, Briefing, RoundActive, RoundReveal, FinalResults, LiveEvent
│   └── ui/             # Button, Input, Countdown
├── lib/
│   ├── auth/           # Session management (cookie-based)
│   ├── db/             # Supabase client + query helpers
│   ├── game/           # State machine + default roles/rounds
│   └── realtime/       # Supabase subscription helpers
├── types/              # TypeScript interfaces
└── supabase/
    └── schema.sql      # Full database schema + RLS
```

---

## Game Flow

```
WAITING → BRIEFING → ROUND_ACTIVE → ROUND_LOCKED → REVEAL → (×3) → FINISHED
```

- All state transitions are server-authoritative
- Players reconnecting mid-game return to the correct state
- Scores are calculated server-side only
- Role information is never exposed across players

---

## Security Model

- All game logic runs server-side via API routes using the Supabase **service role key**
- The browser only holds a signed session cookie (player ID + game ID)
- `player_roles` and `round_assignments` have no anon RLS policies — only the service role can read them
- The client state endpoint only returns a player's own role, never others'

---

## Deployment

Deploy to [Vercel](https://vercel.com) in one command:

```bash
npx vercel
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.
