# ⚡ Buzzer

> **The high-energy quiz show in your pocket.** Beat the clock, build your streak, call lifelines, and compete in live multiplayer party rooms or daily challenges.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_&_Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_First-FF6F00?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Buzzer** brings the thrills of a live television quiz show to the browser. Designed with vibrant stage lighting, responsive vector mascots, satisfying game audio, and an authentic game show stage atmosphere, Buzzer runs completely serverless—leveraging **Supabase Realtime** for peer multiplayer coordination and **PostgreSQL Row Level Security** for verified global leaderboards.

Whether playing solo offline on a commute, challenging colleagues in a live room, or letting kids learn in a safe environment, Buzzer adapts instantly.

---

## ✨ Features

### 🎮 Four Distinct Game Modes
- **Solo Showdown**: Race against the countdown timer across multiple difficulties. Score multipliers scale with your consecutive streak (up to $2\times$), supported by three classic lifelines: **50:50**, **+10s Time Extension**, and **Free Streak-Preserving Skip**.
- **Daily Challenge**: A globally synchronized 10-question challenge deterministically seeded from the current UTC date. Every player on Earth receives identical questions and option shuffles, with exactly one ranked attempt per day recorded on the global daily board.
- **Live Party Rooms (Multiplayer)**: Real-time party play with zero dedicated game servers. Hosts generate a clean 4-letter room code (omitting ambiguous characters). Players join from their mobile devices or laptops. The host's browser acts as the referee via Supabase Realtime broadcast channels, revealing answers only upon round completion and ending with a live podium ceremony.
- **Little Champs (Kids Zone, Ages 6–10)**: Specially curated for younger players with 24 hand-checked, age-appropriate questions across *Animals*, *Space & Science*, *Our World*, and *Food & Body*. Features larger fonts, +10s default bonus time, and a strict **100% on-device privacy guarantee** (no telemetry, no accounts required, zero data uploaded).

### 👾 The Crew (Reactive Mascots)
Choose your companion from four hand-drawn mascots:
- **Zap** ⚡ — The enthusiastic energy spark.
- **Bloop** 🫧 — The bouncy, optimistic companion.
- **Pip** 🐣 — The curious and quick-witted rookie.
- **Rex** 🦖 — The steady trivia titan.

*Mascots react dynamically to your gameplay in real time: they bounce on correct answers, droop on misses, and panic frantically as the clock dips into critical seconds.*

### 🏆 XP, Leveling & Achievement Badges
- **Quadratic Progression Engine**: Earn XP based on score, accuracy, and perfect rounds (`xp = 40 * (level - 1)²`).
- **8 Unlockable Badges**: Earn achievements including *First Buzz*, *Regular*, *Perfect Round*, *On Fire* (5 streak), *Unstoppable* (10 streak), *Explorer* (5 categories), *Daily Habit* (3 daily challenges), and *Big Brain* (100 total correct answers).

### 📱 Offline-First Progressive Web App (PWA)
- Fully installable on iOS, Android, and desktop devices via Web App Manifest.
- Service worker caching (`sw.js`) enables instant boot and full solo play capabilities even without an active internet connection.
- Built-in emergency offline question bank ensures uninterrupted play when disconnected or when third-party APIs are throttled.

---

## 🛠️ Architecture & Engineering Highlights

```
buzzer/
├── public/                 # Favicon, PWA manifest, service worker (sw.js), icons
├── src/
│   ├── components/         # Modular UI: Stage, Mascots, Titles, Confetti Burst, Headers
│   ├── lib/
│   │   ├── game.js         # Pure game engine reducer, scoring, lifelines, offline banks
│   │   ├── room.js         # Authoritative party room referee & anti-cheat broadcast logic
│   │   ├── xp.js           # XP formula, progression curves, and badge evaluator
│   │   ├── history.js      # LocalStorage-backed analytics & personal stats
│   │   ├── realtime.js     # Supabase Realtime pub/sub wrapper
│   │   ├── questions.js    # Open Trivia DB fetcher with automatic offline fallback
│   │   └── supabase.js     # Supabase client & environment configuration
│   └── pages/              # Landing, Play, Game, Results, Leaderboard, Party, Profile, Stats
└── supabase/
    └── schema.sql          # PostgreSQL schema, RLS policies, audit views, plausibility constraints
```

### 🧠 Key Engineering Decisions

| Feature | Architectural Implementation |
|---|---|
| **Host-as-Referee Multiplayer** | Instead of paying for and scaling a Node.js socket server, party rooms utilize Supabase Realtime broadcast channels. The host browser arbitrates timing and conceals the correct answer index from outgoing broadcasts until time expires, preventing client-side network inspection cheats. |
| **Plausibility Score Verification** | PostgreSQL check constraints enforce strict physical limits (`score <= correct * 1200`, `correct <= total`, `total <= 20`). Daily challenge scores enforce one entry per user per UTC day via partial unique index. |
| **Deterministic Daily Quizzes** | Client-side PRNG seeded with the UTC calendar date shuffles questions and options identically across all clients globally without requiring server-side cron jobs. |
| **Decoupled Game State Reducer** | Game and multiplayer room logic live in pure, zero-dependency functions (`game.js`, `room.js`, `xp.js`), thoroughly validated with automated unit tests. |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later recommended)
- `npm` (bundled with Node.js)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/buzzer.git
cd buzzer
npm install
```

### 2. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```

> **Note:** Buzzer plays solo and works offline out of the box without Supabase. To enable user accounts, global leaderboards, and live multiplayer party rooms, supply your Supabase project credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Locally
```bash
# Run test suites
npm test

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Backend Setup (Optional, ~5 Mins)

To enable authentication, cloud profiles, global leaderboards, and party rooms:

1. **Create a Project**: Set up a free project on [supabase.com](https://supabase.com).
2. **Execute Schema**:
   - Open **SQL Editor** > **New Query**.
   - Paste the contents of `supabase/schema.sql` and click **Run**.
   - Verify the creation of `profiles`, `scores`, and the views `leaderboard_alltime` and `leaderboard_daily`.
3. **Configure Authentication**:
   - Navigate to **Authentication** > **Providers** and ensure **Email** is enabled.
   - Go to **Authentication** > **Email Templates** > **Magic Link**. Include `{{ .Token }}` in the template body so players receive a 6-digit login code:
     ```html
     <h2>Your Buzzer Code</h2>
     <p>Enter this code to log in: <b>{{ .Token }}</b></p>
     ```
4. **Enable Realtime**:
   - Confirm **Realtime** is active for your project to support live broadcast channels for party rooms.
5. **Set Environment Keys**:
   - Copy the Project URL and `anon` public key from **Project Settings** > **API** into your `.env` file.

---

## 🧪 Testing

Buzzer features automated test coverage across its core game logic, progression system, referee protocol, and storage engine:

```bash
npm test
```

The test runner validates:
- `src/lib/game.test.js`: Game reducer, scoring calculations, streak multipliers, lifeline behavior, question formatting.
- `src/lib/room.test.js`: Party room referee state transitions, answer timing verification, late answer rejection, result reveals.
- `src/lib/xp.test.js`: XP formulas, level progression boundaries, achievement badge evaluations.
- `src/lib/history.test.js`: Local history tracking and aggregate calculations.

---

## 🌐 Deployment

Buzzer is pre-configured for zero-configuration deployment to [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or any static hosting platform.

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. Set the Framework Preset to **Vite**.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.
6. In your Supabase Dashboard under **Authentication > URL Configuration**, add your production URL to the **Redirect URLs** list.

---

## 🛡️ Security, Privacy & Fair Play

- **Child Safety First**: The *Kids Zone* operates completely offline and on-device. No scores, names, or device fingerprints from kids are ever collected or transmitted.
- **Host Authority in Party Rooms**: Question answer keys are never transmitted to clients until the reveal phase. Answers submitted after the timer window are rejected by the referee.
- **Database Immutability**: Player scores cannot be updated or deleted once posted via Row Level Security restrictions (`revoke update, delete on scores`).
- **Trivia Attribution**: General trivia questions are sourced from the [Open Trivia Database](https://opentdb.com/) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Kids Zone questions are bespoke and hand-verified.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
