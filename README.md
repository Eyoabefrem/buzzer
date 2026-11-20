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

## 🛡️ Security, Privacy & Fair Play

- **Child Safety First**: The *Kids Zone* operates completely offline and on-device. No scores, names, or device fingerprints from kids are ever collected or transmitted.
- **Host Authority in Party Rooms**: Question answer keys are never transmitted to clients until the reveal phase. Answers submitted after the timer window are rejected by the referee.
- **Database Immutability**: Player scores cannot be updated or deleted once posted via Row Level Security restrictions (`revoke update, delete on scores`).
- **Trivia Attribution**: General trivia questions are sourced from the [Open Trivia Database](https://opentdb.com/) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Kids Zone questions are bespoke and hand-verified.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
