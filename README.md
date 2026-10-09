# THE 14

> Kwani me hudoo.

A real-time multiplayer quiz game for up to 14 players on mobile, plus one Game Master. Think Kahoot but faster, more competitive, and with a live podium at the end. The GM picks a category and runs the whole thing while everyone plays from their phones.

---

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. If the realtime block fails, run it separately as a second query
4. Go to **Project Settings → API** and copy your keys

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### Game Master
1. Go to `/gm` → **Create New Game**
2. Share the 5-letter code with your players
3. Pick a category and how many questions
4. Hit **Start Game**
5. Advance each question with **Next Question**
6. Hit **Lock & Reveal** to show the correct answer and how everyone voted
7. Hit **Continue** to move on
8. Podium drops automatically after the last question

### Players
1. Go to `/join` on their phone
2. Enter the game code, a name, and pick an emoji avatar
3. Sit in the lobby until the GM starts
4. When the question appears tap your answer as fast as you can
5. Watch the reveal, check your rank, repeat
6. Final podium shows top 3 with everyone else ranked below

---

## Categories

| Category | Questions |
|---|---|
| 🧠 General Knowledge | 20 |
| ⚽ Sports | 15 |
| 🚗 Cars | 15 |
| ⛩️ Anime | 20 |
| 🎵 Music | 15 |
| ⚡ Wild Facts | 12 |

GM can set between 5 and the category maximum per session.

---

## Scoring

| Result | Points |
|---|---|
| Correct answer | 100 – 250 (varies by question) |
| 1st correct | Full speed bonus |
| 2nd correct | Half speed bonus |
| 3rd correct | Quarter speed bonus |
| Wrong or no answer | 0 |

Scores update live on the GM panel after every question.

---

## Project Structure

```
the14/
├── app/
│   ├── join/               # Player join page + avatar picker
│   ├── room/               # Main player game view
│   ├── gm/                 # GM create page
│   │   └── control/        # GM control panel + live scores
│   └── api/
│       ├── game/           # join, create, state
│       ├── round/          # GM controls (next, lock, reveal)
│       └── action/         # Player answer submission
├── components/
│   ├── game/
│   │   ├── WaitingRoom     # Live lobby as players join
│   │   ├── CategoryReveal  # Category shown before first question
│   │   ├── QuestionScreen  # Question + 4 options + countdown
│   │   ├── QuestionResult  # Correct answer + answer distribution
│   │   └── Podium          # Final top 3 + full rankings
│   └── ui/
│       ├── Button
│       ├── Input
│       ├── Countdown
│       └── Avatar          # Emoji avatar picker and display
├── lib/
│   ├── auth/               # Cookie-based session (no accounts needed)
│   ├── db/                 # Supabase client + query helpers
│   ├── game/
│   │   ├── questions.ts    # All questions across all categories
│   │   └── stateMachine.ts # Server-side game state transitions
│   └── realtime/           # Supabase realtime subscriptions
├── types/                  # TypeScript interfaces
└── supabase/
    └── schema.sql          # Database schema + RLS + realtime
```

---

## Game State Flow

```
WAITING → CATEGORY → ACTIVE → QUESTION_RESULT → (repeat) → FINISHED
```

- Every state transition happens server-side
- Players who disconnect and reconnect return to the correct state automatically
- The correct answer is never sent to the client until the GM triggers reveal
- Double submissions are blocked at the database level

---

## Security

- All game logic runs server-side using the Supabase service role key
- Players hold only a session cookie (player ID + game ID) — no accounts required
- Answer correctness is stripped from API responses until reveal phase
- Scores are calculated server-side only and never trusted from the client

---

## Adding Questions

All questions live in `lib/game/questions.ts`. Each question follows this shape:

```ts
{
  id: 'unique_id',
  category: 'general',
  question: 'Your question here?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0,        // index of correct option (0–3)
  points: 150,       // base points for correct answer
  speedBonus: 75,    // bonus for fastest correct answer
}
```

Add to any existing category or create a new one by adding it to the
`CATEGORIES` and `QUESTIONS` objects in the same file.

---

## PWA — Install as App

Installable as a home screen app on mobile.

- **iPhone** — Safari → Share → Add to Home Screen
- **Android** — Chrome will prompt automatically

Opens fullscreen, no browser bar.

---

## Deployment

```bash
npx vercel
```

Set these three environment variables in Vercel under **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
