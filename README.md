# Buzzer: a quiz show for kids, teens and grown-ups (Phases 2 and 3 in one zip)

| Phase | What you get | Needs |
|---|---|---|
| 1. The solo show (done) | Timer, scoring, streaks, lifelines, results, stats | Node.js |
| **2 and 3. Accounts, daily challenge, leaderboard, live party rooms (this zip)** | **Game-style title screen, doodle mascots, kids zone, XP, levels and badges, daily challenge, leaderboard, live multiplayer rooms, installable app** | A free Supabase project (the game still plays solo without it) |
| 4. Mobile app (next) | Android (and iPhone) app built from this same code | Android Studio |

## What's new

- **A title screen that feels like a game.** Press the giant buzzer to start the show, then pick from a menu of game tiles. Floating doodles, sweeping spotlights, and a player card with your level.
- **The crew:** four hand-drawn mascots (Zap, Bloop, Pip, Rex). They hop when you are right, droop when you are wrong, and panic when the clock runs low. Pick yours in Your crew.
- **Kids zone (ages 6 to 10):** 24 hand-checked easy questions across Animals, Space and science, Our world, and Food and body. Bigger text, 10 extra seconds, and scores are never uploaded. Kids can play with no account.
- **Daily challenge:** the same ten questions for everyone each day (UTC), one ranked try.
- **XP, levels and 8 badges.** Earn XP from score, correct answers and perfect rounds.
- **Leaderboard:** today's challenge and all-time best.
- **Live party rooms:** one person hosts and gets a 4-letter code. Friends join on their own phones. Everyone sees the same question at the same time, the host's browser scores the answers, and a scoreboard and podium finish the show. Works for classrooms and family nights.
- **Share your score**, and an **installable app** that opens offline.

## 1. Set up Supabase (about 15 minutes)

You can skip this and play solo, but the leaderboard, daily rankings and party rooms need it.

1. Create a free project at supabase.com.
2. **SQL Editor > New query**, paste all of `supabase/schema.sql`, press **Run**. Check Table Editor for `profiles` and `scores`.
3. **Authentication > Sign In / Providers**: make sure **Email** is enabled.
4. **Authentication > Email Templates > Magic Link**: edit the body so it contains `{{ .Token }}`, for example:

       <h2>Your Buzzer code</h2>
       <p>Enter this code to log in: <b>{{ .Token }}</b></p>

5. **Project Settings > API**: copy the Project URL and the **anon public** key. Never use the service_role key in this app.
6. Party rooms use **Realtime**, which needs no tables. If joining a room hangs, check that Realtime is enabled for your project and that it allows public (anonymous) channels. The Supabase dashboard layout changes, so follow its own wording.

## 2. Run it

    copy .env.example .env      (open .env and paste the two values)
    npm install
    npm test
    npm run dev

Restart `npm run dev` after changing `.env`. `npm test` runs four suites: game rules and questions, history and stats, XP and badges, and the party-room referee.

## 3. Try these

1. Open the title screen and press the buzzer. Tap the crew members: each reacts.
2. Play a round: watch your mascot hop, droop and panic as the clock runs down.
3. Play > Little champs > pick a category. Notice the bigger text, the extra time, and the "stays on this device" note.
4. Play the Daily challenge. Finish: you get XP, maybe a badge, and a share button. Play it again: it becomes a practice round.
5. Log in (Your crew > Log in) and play again. Open Board: your score is there, highlighted.
6. **Party test with two windows:** in one window, Party > Create room. Copy the 4-letter code. In a second window (a private window works best, so it counts as a different player), Party > type the code > Join. Press **Start the show** in the first window. Answer in both. Watch the scoreboard, then the podium.
7. Close the host window mid-game: the other player sees "The host left the room".
8. After deploying, open the site on a phone and use "Add to Home Screen". It opens offline for solo play.

## Architecture

    buzzer/
    ├── index.html, vite.config.js, vercel.json, package.json, .env.example
    ├── supabase/schema.sql         profiles, scores, two leaderboard views, security rules
    ├── public/                     favicon, app icons, manifest, sw.js (offline)
    └── src/
        ├── main.jsx                routes and providers
        ├── index.css               stage tokens, bulbs, spotlights, animations
        ├── lib/
        │   ├── game.js (+test)     scoring, the game reducer, offline bank, daily questions, kids bank
        │   ├── xp.js (+test)       XP, levels, badges
        │   ├── room.js (+test)     the party-room referee: scoring, one answer each, hidden answers
        │   ├── history.js (+test)  stats saved on this device
        │   ├── questions.js        online questions with offline fallback
        │   ├── realtime.js         one Supabase Realtime channel per room
        │   ├── supabase.js, auth.jsx, cloud.js, profile.jsx, sound.js
        ├── components/             Mascot, Burst, Header, Logo, Stage, Titles
        └── pages/                  Landing, Play, Game, Results, Leaderboard, Profile, Login, Party, Stats, NotFound

### Decisions worth knowing

- **The host is the referee in party rooms.** Everyone sends their answer to the host's browser, which scores it and shares the results. The right answer is only sent after the question closes, so players cannot read it from the network while answering. There is no game server to run or pay for.
- **Kids stay private.** Kids zone profiles, nicknames and scores are never uploaded. Party rooms are reachable only with the 4-letter code.
- **Leaderboard fairness is plausibility, not proof.** The database rejects impossible scores (at most 1,200 points per right answer, correct answers cannot exceed questions, one daily score per person per day, scores cannot be edited or deleted). A determined cheater could still post a high but possible score, because scoring runs in the player's browser.
- **The daily challenge needs no server:** the date seeds a shuffle, so everyone gets the same questions and the same answer order.
- **Logic is tested, screens are thin.** Rules live in `src/lib` as plain functions.

## Deploy (free)

1. Put the project on GitHub: `git init`, `git add .`, `git commit -m "Buzzer"`, create an empty repository on github.com and run the two lines it shows. The `.gitignore` keeps `.env` out of GitHub.
2. vercel.com > **Add New > Project** > import the repository. Leave the framework as Vite.
3. Add two environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Deploy.
4. Supabase > **Authentication > URL Configuration**: set the Site URL to your Vercel address.
5. Repeat try-it checks 5 and 6 on the live site.

## Before you share it widely

- **Nicknames are free text** on the leaderboard and in rooms, with no profanity filter or reporting. For a school or a public launch, add moderation. Kids get friendly rolled nicknames by default, and kids' names are never uploaded.
- **Party rooms:** if the host closes their tab the room ends. A player who loses signal can rejoin with the same code. A player who never answers makes each question wait for its timer. Supabase Realtime has free-plan limits, so very large rooms need a paid plan.
- **Supabase's built-in email sender** allows only a few login codes per hour. Add your own provider (Authentication > SMTP) before real traffic.
- **Online questions** come from the Open Trivia Database (CC BY-SA 4.0). The credit shown in the app must stay, and that service is not curated for children, which is why Kids zone uses only the built-in questions.

## If something goes wrong

- **"Accounts are not set up yet":** `.env` is missing, misnamed, or the dev server was not restarted.
- **Email has a link but no code:** you did not edit the Magic Link template (step 4).
- **A room join hangs on "Connecting":** check the Realtime note in step 6, and that both players have internet.
- **"Couldn't post your score" on the results screen:** the schema was not run completely, or you played the daily challenge twice (only one ranked try per day).
- **A file is 0 bytes after copying:** run `Get-ChildItem -Recurse src -File | Select-Object FullName, Length`.
