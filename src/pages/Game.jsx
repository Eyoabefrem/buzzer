import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, X, Zap, Clock, SkipForward } from 'lucide-react'
import Header from '../components/Header'
import { SHADES } from '../components/Stage'
import { loadQuestions } from '../lib/questions'
import { initGame, reduce, fiftyFifty, multiplier, dailyQuestions, pickKids, todayUTC } from '../lib/game'
import { addGame, getHistory } from '../lib/history'
import { play } from '../lib/sound'
import Mascot from '../components/Mascot'
import { useAuth } from '../lib/auth'
import { useProfile } from '../lib/profile'
import { submitScore } from '../lib/cloud'
import { earned, xpFor } from '../lib/xp'

export default function Game() {
  const { state: cfg } = useLocation()
  const nav = useNavigate()
  const { user } = useAuth()
  const prof = useProfile()
  const [game, setGame] = useState(null)
  const [source, setSource] = useState('online')
  const [count, setCount] = useState(3)
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(Date.now())
  const saved = useRef(false)
  const send = (a) => setGame((s) => reduce(s, a))

  useEffect(() => {
    if (!cfg) return nav('/play', { replace: true })
    let off = false
    const load = cfg.daily ? Promise.resolve({ source: 'daily', questions: dailyQuestions(todayUTC()) }) : cfg.kids ? Promise.resolve({ source: 'kids', questions: pickKids({ category: cfg.category || 0, amount: cfg.amount }) }) : loadQuestions(cfg)
    load.then((r) => { if (!off) { setSource(r.source); setGame(initGame(r.questions, { bonus: cfg.kids ? 10 : 0 })) } })
    return () => { off = true }
  }, [])
  useEffect(() => { if (game && count > 0) { const t = setTimeout(() => { setCount((c) => c - 1); if (count === 1) play('go') }, 800); return () => clearTimeout(t) } }, [game, count])
  // Start the clock for each new question
  useEffect(() => { if (game && count === 0 && game.phase === 'ask' && deadline === 0) { setDeadline(Date.now() + game.limit * 1000); setNow(Date.now()) } }, [game, count, deadline])
  useEffect(() => { if (game?.phase !== 'ask' || !deadline) return; const t = setInterval(() => setNow(Date.now()), 100); return () => clearInterval(t) }, [game?.phase, deadline])

  const timeLeft = deadline ? Math.max(0, (deadline - now) / 1000) : game?.limit ?? 0
  useEffect(() => { if (game?.phase === 'ask' && deadline && timeLeft <= 0) { play('wrong'); send({ type: 'timeout', timeLeft: 0 }) } }, [timeLeft <= 0, deadline])
  useEffect(() => { if (game?.phase === 'ask' && deadline && timeLeft > 0 && timeLeft <= 5 && Math.ceil(timeLeft) !== Math.ceil(timeLeft + 0.1)) play('tick') }, [Math.ceil(timeLeft)])

  const q = game?.questions[game.i]
  const pick = (i) => {
    if (game.phase !== 'ask' || game.hidden.includes(i)) return
    play(i === q.correct ? 'right' : 'wrong')
    send({ type: 'answer', pick: i, timeLeft: Math.max(0, (deadline - Date.now()) / 1000) })
  }
  const next = () => { setDeadline(0); send({ type: 'next' }) }
  const fifty = () => send({ type: 'fifty', hide: fiftyFifty(q) })
  const more = () => { send({ type: 'time' }); setDeadline((d) => d + 10000) }
  const skip = () => { setDeadline(0); send({ type: 'skip' }) }

  useEffect(() => {
    const onKey = (e) => {
      if (!game || count > 0) return
      const i = 'abcd'.indexOf(e.key.toLowerCase()), n = ['1', '2', '3', '4'].indexOf(e.key), idx = i >= 0 ? i : n
      if (game.phase === 'ask' && idx >= 0) pick(idx)
      else if (game.phase === 'reveal' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Finished: save the game, work out XP and badges, post the score, and show results
  useEffect(() => {
    if (game?.phase !== 'done' || saved.current) return
    saved.current = true
    const cats = {}
    game.questions.forEach((x, i) => { const c = (cats[x.category] ||= { correct: 0, total: 0 }); if (!game.log[i].skipped) { c.total++; if (game.log[i].ok) c.correct++ } })
    const answered = game.log.filter((l) => !l.skipped), correct = answered.filter((l) => l.ok).length
    const prevBest = Math.max(0, ...getHistory().map((g) => g.score))
    const mode = cfg.daily ? 'daily' : 'solo'
    const result = { date: Date.now(), day: todayUTC(), mode, kids: !!cfg.kids, score: game.score, correct, total: answered.length, bestStreak: game.best, categories: cats, source }
    const before = earned(getHistory())
    addGame(result)
    const badges = earned(getHistory()).filter((b) => !before.includes(b))
    if (cfg.daily) { try { localStorage.setItem('buzzer-daily', JSON.stringify({ day: result.day, score: result.score })) } catch {} }
    const eligible = user && !cfg.kids && answered.length > 0 && (!cfg.daily || cfg.ranked !== false)
    ;(async () => {
      const submit = eligible ? await submitScore(result).then(() => 'ok', (e) => e.message) : null
      const full = { ...result, prevBest, submit, badges, xp: xpFor(result), log: game.log, questions: game.questions.map(({ text, answers, correct: c, category }) => ({ text, answers, correct: c, category })) }
      try { localStorage.setItem('buzzer-last', JSON.stringify(full)) } catch {}
      nav('/results', { replace: true, state: full })
    })()
  }, [game?.phase])

  if (!game || count > 0) return (
    <div className="min-h-screen grid place-items-center text-center p-6 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0"><div className="beam beam-a" /><div className="beam beam-b" /></div>
      <div className="relative">
        {!game ? <><p className="display text-4xl pop">Warming up the studio</p><p className="mt-4 font-semibold" style={{ color: 'var(--muted)' }}>Fetching your questions</p></> :
          <><p className="font-bold text-xl">Get ready</p><p key={count} className="display text-[10rem] pop" style={{ color: 'var(--y)', textShadow: '0 8px 0 var(--dk)' }}>{count}</p></>}
      </div>
    </div>
  )

  const reveal = game.phase === 'reveal'
  const last = game.log[game.log.length - 1]
  const frac = Math.min(1, timeLeft / game.limit)
  const mood = reveal ? (last.ok ? 'happy' : 'sad') : timeLeft <= 5 ? 'panic' : 'idle'
  const lifeBtn = (on, fn, Icon, label) => <button onClick={fn} disabled={!on || reveal} className="btn !py-2 !px-4 flex items-center gap-2 text-sm"><Icon size={16} />{label}</button>

  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-5 pb-12">
        <div className="flex items-center justify-between font-extrabold text-lg">
          <span>Question {game.i + 1} of {game.questions.length}</span>
          <span className="flex items-center gap-3">
            {game.streak >= 2 && <span key={game.streak} className="pop px-3 py-0.5 rounded-full border-4 border-[var(--dk)] text-sm" style={{ background: 'var(--p)', color: 'var(--dk)' }}>{game.streak} in a row, x{multiplier(game.streak)}</span>}
            <span className="display text-3xl tabular-nums" style={{ color: 'var(--y)' }}>{game.score.toLocaleString()}</span>
          </span>
        </div>
        <div className="h-5 mt-3 rounded-full border-4 border-[var(--dk)] overflow-hidden bg-[var(--card)]" role="timer" aria-label={`${Math.ceil(timeLeft)} seconds left`}>
          <div className="h-full" style={{ width: `${frac * 100}%`, background: frac > 0.5 ? 'var(--l)' : frac > 0.25 ? 'var(--y)' : 'var(--p)', transition: 'background .3s' }} />
        </div>

        <div className="panel mt-6 overflow-hidden">
          <div className="bulbs" />
          <div className="p-6 sm:p-8 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: 'var(--muted)' }}>{cfg.daily ? 'Daily challenge, ' : ''}{q.category}, {q.difficulty}</p>
              <h1 className={`display ${cfg.kids ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'} mt-2 leading-tight`}>{q.text}</h1>
            </div>
            <Mascot kind={prof.mascot} mood={mood} size={84} className="shrink-0" />
          </div>
          <div className="bulbs" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {q.answers.map((a, i) => {
            const hidden = game.hidden.includes(i)
            const st = !reveal ? '' : i === q.correct ? 'right' : i === game.picked ? 'wrong' : 'dim'
            return (
              <button key={i} onClick={() => pick(i)} disabled={hidden || reveal} aria-label={`${'ABCD'[i]}: ${a}`}
                className={`rounded-2xl border-4 border-[var(--dk)] px-4 py-4 font-extrabold text-lg text-left flex items-center gap-3 transition-all ${st === 'wrong' ? 'shake' : ''} ${!reveal && !hidden ? 'hover:-translate-y-1' : ''}`}
                style={{ background: SHADES[i], color: 'var(--dk)', opacity: hidden ? 0.12 : st === 'dim' ? 0.4 : 1, boxShadow: hidden ? 'none' : '0 6px 0 var(--dk)', outline: st === 'right' ? '5px solid var(--ink)' : 'none', outlineOffset: 3 }}>
                <span className="grid place-items-center size-9 shrink-0 rounded-full bg-[var(--dk)] text-white">{'ABCD'[i]}</span>
                <span className="flex-1">{a}</span>
                {st === 'right' && <Check size={26} strokeWidth={4} />}{st === 'wrong' && <X size={26} strokeWidth={4} />}
              </button>
            )
          })}
        </div>

        {reveal ? (
          <div className="panel p-5 mt-8 flex flex-wrap items-center justify-between gap-4" aria-live="polite">
            <p className="display text-2xl pop" style={{ color: last.ok ? 'var(--l)' : 'var(--p)' }}>{last.ok ? `Correct! +${game.lastPts}` : game.picked === null ? "Time's up" : 'Not quite'}</p>
            {!last.ok && <p className="font-semibold">Answer: {q.answers[q.correct]}</p>}
            <button onClick={next} className="btn">{game.i + 1 >= game.questions.length ? 'See results' : 'Next question'}</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 mt-8"><span className="font-bold self-center">Lifelines</span>{lifeBtn(game.life.fifty, fifty, Zap, '50:50')}{lifeBtn(game.life.time, more, Clock, '+10s')}{lifeBtn(game.life.skip, skip, SkipForward, 'Skip')}</div>
        )}
        {source === 'offline' && <p className="mt-6 text-sm font-semibold" style={{ color: 'var(--muted)' }}>Playing with the built-in questions (the online service was busy or unreachable).</p>}
      </main>
    </div>
  )
}
