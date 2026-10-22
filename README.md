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
5. With **Auto play** on (the default), the game runs itself: the answer is revealed when everyone has answered or the timer runs out, the reveal stays up for 6 seconds (9 for Bluff, Closest and Most Likely), standings show for 5 seconds every 3 questions and before the final results, then the next question starts. A "Next in" countdown shows in the control bar and you can tap the button to skip ahead.
6. Turn Auto play off to drive it yourself. **Auto reveal** can stay on alone, and after each reveal you choose **Standings** or **Next question**.
7. The podium and awards drop after the last question. **Play again** keeps the same code and players, and **New game** starts fresh with a new code.

**Starting a fresh game:** tap **New game** in the top bar of the GM screen at any time, or open `/gm` and choose **Start a new game** (it also offers **Continue** if you already have a game open). The old game is wrapped up automatically: players mid-game see the podium, and players still in the lobby are told the host started a new game. The lobby shows **Copy link** and **Share invite** buttons with a join link that fills in the code, and the join page remembers each player's name and avatar.

**No duplicate players:** joining again from the same phone gives you your own seat back. Joining with the name of a player who has gone quiet takes that seat back with its score, which also lets people rejoin a game in progress. If that name belongs to someone still active, the joiner is asked to add an initial. Phones check in quietly in the background; players who stop checking in show as faded "away", do not hold up auto reveal and are left out of Most Likely To. The host can remove anyone with the × in the players list.

### Players
1. Go to `/join` on their phone
2. Enter the game code and a name, then build an avatar (7 styles, colours, endless looks). Characters react during the game: they smile when you are right, sulk when you are wrong, sway gently in the lobby and cheer or droop as the standings move.
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
| Odd One Out | Four things, one does not belong. The reveal says why. |
| Fastest Finger | Classic questions where only the first right answer scores, and it scores double. |
| Most Likely To | Party mode. Vote for a player. Side with the room to score. |
| Bluff | Party mode. Everyone writes a fake answer, then tries to find the real one. Points for every player your fake fools. |
| Would You Rather | Party mode. Pick one of two options. Side with the room to score. Worth half points, since it is a matter of taste. |
| Sync | Party mode. How in sync is the room? Try it and see. |

Party rounds are capped at about one in six questions and never open the game.

**Final Wager:** a switch in setup. The last question becomes a bet: everyone stakes up to half their points (at least 200) before seeing it, then wins or loses the bet. Scores never drop below zero.

---

## Categories

1900 questions across 44 categories, each marked easy, medium or hard.

| Group | Categories (questions) |
|---|---|
| **Brain** | 🧠 General Knowledge (45), 🔬 Science (48), 🏛️ History (46), 🗺️ Flags & Places (59), 🪐 Space (43), 🧩 Riddles & Numbers (34), ⚡ Wild Facts (26), 💻 Tech (47), 🔤 Words & Language (35), ⚱️ Mythology (36), 🫀 Human Body (41), 🏆 World Records (31), 💡 Inventions (34), 🦖 Dinosaurs (36) |
| **Pop Culture** | ⛩️ Anime (97), 🎬 Movies & TV (58), 🎵 Music (43), 🎮 Gaming (36), 📱 Internet Culture (31), 🦸 Superheroes (32), 📺 Cartoons (31), 📚 Books & Literature (37), 🥁 African Music (33), 🎤 Hip-Hop & R&B (32), 🍿 TV Series (35), 🏰 Disney & Pixar (33), 📼 2000s Throwback (33), 🔍 Mysteries & Detectives (32) |
| **Sports** | 🏅 Sports Mix (32), ⚽ Football (44), 🏀 Basketball (31), 🏎️ Motorsport (30), 🏃 Athletics & Olympics (34), 🎾 Tennis, Rugby & Cricket (30), 🤼 Wrestling (33) |
| **Kenya & Africa** | 🇰🇪 Kenya (43), 🌍 Africa (50) |
| **Lifestyle** | 🍕 Food & Drinks (36), 🚗 Cars (34), 🐘 Animals (35), 🏷️ Brands & Logos (33), 💰 Money & Business (35), 👗 Fashion (34), 🌊 Ocean & Nature (31) |

Plus 90 Most Likely To prompts, 51 Bluff prompts and 70 Would You Rather prompts that work with any category.

### Difficulty

Every question is easy (100 points), medium (150) or hard (200 and up). Players never see the level on screen. In setup the GM picks **Mixed**, **Rising** (a third each, easy to hard as the game goes on), **Easy**, **Medium** or **Hard**. A chosen level is strict: a Hard game only uses hard questions, and if the picked categories run short the game is shorter rather than mixing in easier ones. Setup shows how many easy, medium and hard questions the selected categories have.

---

## Scoring

| Result | Points |
|---|---|
| Correct answer | 100 to 200 (varies by question) |
| 1st, 2nd, 3rd fastest correct | Full, half, quarter speed bonus |
| Streak of 3 or more correct | +50 per question while it lasts |
| Closest Wins | Up to full points depending on how close, plus a bonus for the closest guess |
| Put in Order | Full points and speed bonus for a perfect order, partial points for some in place |
| Most Likely To, Would You Rather | Full points if you voted with the majority |
| Bluff | Full points for finding the real answer, +75 for every player who picks your fake |
| Wrong or no answer | 0 |

Answer time is measured on the server from the moment the question opens, so it cannot be faked from a phone. A tap under 1.2 seconds is marked "too fast".

At the end, awards go to the sharpest mind, the fastest finger, the hottest streak, the biggest comeback, the boldest guesser and the best bluffer.

Every player also gets a tag, so nobody leaves empty handed. Award winners keep their award, and everyone else gets one from how they played: Champion, Brainbox, Quick draw, On fire, Climber, Sneaky, Trigger happy, Steady, Here for the vibes, Warming up and more.

### Result cards

- **Players** can share or save a 1080 x 1920 card (status and story size) with their placing, tag and stats (answers right, best streak, average speed), a podium with the top 3, and places 4 to 6 listed below it. If they finished 7th or lower, their own row is added at the bottom.
- **The GM** gets a group card on the podium screen with the top 3 and every player with their tag, ready to post in the group chat.

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
- `bonus.ts`, `hardA.ts`, `hardB.ts`, `hardC.ts` and `hardTypes.ts` hold the hard rounds
- `anime.ts` has the Death Note, Avatar, Attack on Titan and Castlevania packs
- `fun.ts` has Disney & Pixar, 2000s Throwback, Mysteries & Detectives and Wrestling
- `party.ts` has more Would You Rather, Most Likely To and Bluff prompts

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

## Voice Chat

Free voice chat for playing with friends who are far away. No account, no keys, no monthly limit.

- Tap **Voice** (bottom right on phones, top bar for the host), then **Join voice**. Up to 8 people.
- Phones connect straight to each other. The game's Supabase Realtime connection only introduces them; no audio goes through any server.
- Mute button, speaking rings on avatars, and the host can mute one person or everyone.
- **Quiet during questions** (on by default) mutes players while a question is live so nobody shouts the answer, then unmutes for the reveal. The host stays unmuted, since they never see answers early.
- **Backup call link**: the host can paste a WhatsApp, Meet or Discord call link. Everyone then sees a Join call button. Use it for groups bigger than 8, or for anyone whose network blocks direct calls.
- Earphones give the best sound. On iPhones the mic usually pauses when the screen locks.

If some players often show "can't connect", their network blocks direct connections. You can add a relay (TURN) server with the optional `NEXT_PUBLIC_TURN_*` variables in `.env.local.example`.

## Install as an App

Installable as a home screen app on mobile. The join page and GM page show a "Get the app" card that adapts to the phone:

- **Android (Chrome, Edge, Samsung)**: an Install button that opens the install dialog in one tap
- **iPhone (Safari)**: the exact steps, Share then Add to Home Screen
- **Inside WhatsApp, Instagram and similar**: these cannot install apps, so the card explains how to open the page in Chrome or Safari and offers a Copy link button
- **Already installed**: the card stays hidden. Players can also close it, and it stays away for a week.

- **iPhone**: Safari → Share → Add to Home Screen
- **Android**: Chrome will prompt automatically

Opens fullscreen, no browser bar, with its own icon and splash colour. A small service worker makes it installable and shows a friendly offline screen if the connection drops. Game data always comes live from the server.

If you installed an older version that did not work, remove it from your home screen and add it again.

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

---

## Credits

Avatars are drawn with [DiceBear](https://www.dicebear.com):

- Adventurer by Lisa Wischofsky, Big Smile by Ashley Seo, Micah by Micah Lanier, and Toon Head by Johan Melin, all CC BY 4.0
- Lorelei by Lisa Wischofsky and Open Peeps by Pablo Stanley, both CC0 1.0
- Avataaars by Pablo Stanley, free for personal and commercial use
