# THE 14

> Kwani me hudoo.

A real-time multiplayer party quiz for up to 14 players on their phones, plus one Game Master who runs the show from a laptop, a TV, or their own phone. Think Kahoot, but faster, with more game types, a live podium and a bit of attitude.

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

**Already have a database from an older version?** Run `supabase/migrations/002_game_modes.sql` once instead. It adds the new columns and keeps your data.

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
1. Go to `/gm` and create a game
2. Put the GM screen on a TV or laptop if you can. It turns into a big host screen with the join code, questions, reveals, standings and the podium. On a phone it works as a control panel.
3. Pick categories (grouped into Brain, Pop Culture, Sports, Kenya & Africa, Lifestyle), game types, number of questions and time per question
4. Hit **Start game**, then **Start question 1**
5. With **Auto reveal** on, the answer is revealed when everyone has answered or the timer runs out. You can also reveal by hand.
6. After each reveal choose **Standings** to show the leaderboard, or go straight to **Next question**
7. The podium and awards drop after the last question. **Play again** keeps the same players.

### Players
1. Go to `/join` on their phone
2. Enter the game code and a name, then build an avatar (4 styles, colours, endless looks)
3. Wait in the lobby until the GM starts
4. Every question opens with a short "get ready" countdown that is synced across all phones
5. Answer as fast as you can. Tap too fast and the game notices. Get it wrong after a speedy tap and you will hear about it.
6. See your result, the correct answer and how everyone voted, then the standings
7. Send live emoji reactions that float up on the host screen

---

## Game Types

| Type | How it plays |
|---|---|
| Classic | Four options, one right answer |
| True or False | Quick calls with a shorter timer |
| Emoji Decode | Guess the movie, show or brand from emojis |
| Picture Round | A flag starts blurred and zoomed in, then sharpens. Earlier is harder. |
| Closest Wins | Guess a number with a slider. Closest gets the most points. |
| Put in Order | Tap four items in the right order |
| Most Likely To | Party mode. Vote for a player. Side with the room to score. |
| Bluff | Party mode. Everyone writes a fake answer, then tries to find the real one. Points for every player your fake fools. |

Party rounds are capped at about one in six questions and never open the game.

---

## Categories

651 questions across 34 categories.

| Group | Categories (questions) |
|---|---|
| **Brain** | 🧠 General Knowledge (22), 🔬 Science (20), 🏛️ History (20), 🗺️ Flags & Places (32), 🪐 Space (17), 🧩 Riddles & Numbers (15), ⚡ Wild Facts (13), 💻 Tech (23), 🔤 Words & Language (16), ⚱️ Mythology (16), 🫀 Human Body (19) |
| **Pop Culture** | ⛩️ Anime (23), 🎬 Movies & TV (30), 🎵 Music (18), 🎮 Gaming (19), 📱 Internet Culture (14), 🦸 Superheroes (16), 📺 Cartoons (15), 📚 Books & Literature (17), 🥁 African Music (16) |
| **Sports** | 🏅 Sports Mix (15), ⚽ Football (19), 🏀 Basketball (14), 🏎️ Motorsport (13), 🏃 Athletics & Olympics (15), 🎾 Tennis, Rugby & Cricket (13) |
| **Kenya & Africa** | 🇰🇪 Kenya (19), 🌍 Africa (25) |
| **Lifestyle** | 🍕 Food & Drinks (17), 🚗 Cars (16), 🐘 Animals (19), 🏷️ Brands & Logos (16), 💰 Money & Business (17), 👗 Fashion (16) |

Plus 20 Most Likely To prompts and 16 Bluff prompts that work with any category.

---

## Scoring

| Result | Points |
|---|---|
| Correct answer | 100 to 200 (varies by question) |
| 1st, 2nd, 3rd fastest correct | Full, half, quarter speed bonus |
| Streak of 3 or more correct | +50 per question while it lasts |
| Closest Wins | Up to full points depending on how close, plus a bonus for the closest guess |
| Put in Order | Full points and speed bonus for a perfect order, partial points for some in place |
| Most Likely To | Full points if you voted with the majority |
| Bluff | Full points for finding the real answer, +75 for every player who picks your fake |
| Wrong or no answer | 0 |

Answer time is measured on the server from the moment the question opens, so it cannot be faked from a phone. A tap under 1.2 seconds is marked "too fast".

At the end, awards go to the sharpest mind, the fastest finger, the hottest streak, the biggest comeback, the boldest guesser and the best bluffer.

---

## Project Structure

```
the14/
├── app/
│   ├── join/               # Player join page + avatar builder
│   ├── room/               # Player game view
│   ├── gm/                 # GM create page
│   │   └── control/        # Host screen + controls
│   └── api/
│       ├── game/           # join, create, state
│       ├── round/          # GM controls (start, next, voting, reveal, standings, end, play again)
│       └── action/         # Player answer submission
├── components/
│   ├── game/
│   │   ├── WaitingRoom     # Lobby
│   │   ├── GameIntro       # Shown after the GM starts the game
│   │   ├── GetReady        # Synced 3, 2, 1 before each question
│   │   ├── QuestionScreen  # Player question view for every game type
│   │   ├── answers         # Answer inputs per game type
│   │   ├── QuestionResult  # Personal result, reaction line, reveal
│   │   ├── RevealBoard     # How everyone answered (phone and host sizes)
│   │   ├── Standings       # Leaderboard with movement arrows
│   │   ├── Podium          # Final top 3, awards, everyone else
│   │   └── Reactions       # Live emoji reactions
│   ├── gm/
│   │   ├── GameSetup       # Categories, game types, length, timer
│   │   └── HostStage       # Big screen view for each phase
│   └── ui/                 # Button, Input, TimerBar, Avatar, SoundToggle
├── lib/
│   ├── auth/               # Cookie-based session (no accounts needed)
│   ├── db/                 # Supabase client + query helpers
│   ├── game/
│   │   ├── questions/      # Question bank, categories, game types
│   │   ├── scoring.ts      # Grading for every type, streaks, ranks, awards
│   │   ├── lines.ts        # Result lines and light roasts
│   │   └── stateMachine.ts # Server-side game state transitions
│   ├── hooks/              # Shared game state hook
│   ├── realtime/           # Supabase realtime + reaction broadcast
│   ├── avatar.ts           # Avatar ids and validation
│   ├── clock.ts            # Server clock sync for countdowns
│   └── sound.ts            # Small synthesized sounds + vibration
├── types/                  # TypeScript interfaces
└── supabase/
    ├── schema.sql          # Full schema for fresh installs
    └── migrations/         # Upgrades for existing databases
```

---

## Game State Flow

```
WAITING → CATEGORY (intro) → ACTIVE → QUESTION_RESULT → (LEADERBOARD) → ACTIVE → ... → FINISHED
```

- Every state transition happens server-side
- Each question starts with a 3.5 second get-ready window, timed by the server
- Bluff rounds have two phases inside ACTIVE: writing, then voting
- Players who disconnect and reconnect return to the correct state automatically
- The correct answer never reaches a phone until the reveal
- Double submissions are blocked at the database level, and a reveal can only award points once

---

## Adding Questions

Questions live in `lib/game/questions/`:

- `classic.ts`, `more.ts` and `extra.ts` hold multiple choice questions (`extra.ts` also has a few special types for the newer categories)
- `special.ts` holds True or False, Emoji, Picture, Closest, Order, Most Likely To and Bluff

A classic question looks like this:

```ts
{
  id: 'unique_id',
  category: 'general',
  question: 'Your question here?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0,        // index of the correct option
  points: 150,       // base points for a correct answer
  speedBonus: 75,    // bonus for the fastest correct answer
}
```

To add a category, add it to the `Category` type and `CATEGORIES` in `schema.ts` with a group.

---

## Install as an App

Installable as a home screen app on mobile.

- **iPhone**: Safari → Share → Add to Home Screen
- **Android**: Chrome will prompt automatically

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
