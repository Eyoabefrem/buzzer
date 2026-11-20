import { useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { Check, X, SkipForward, Share2 } from 'lucide-react'
import Header from '../components/Header'
import Mascot from '../components/Mascot'
import { rating } from '../lib/game'
import { BADGES, totalXp, levelProgress } from '../lib/xp'
import { getHistory } from '../lib/history'
import { useProfile } from '../lib/profile'

const load = () => { try { return JSON.parse(localStorage.getItem('buzzer-last')) } catch { return null } }

export default function Results() {
  const { state } = useLocation()
  const prof = useProfile()
  const [note, setNote] = useState('')
  const r = state || load()
  if (!r) return <Navigate to="/play" replace />
  const accuracy = r.total ? Math.round((r.correct / r.total) * 100) : 0
  const isBest = r.score > 0 && r.score > r.prevBest
  const lp = levelProgress(totalXp(getHistory()))
  const colors = ['#ff2e93', '#ffd400', '#19d3ff', '#7dff4f']
  const share = async () => {
    const text = `I scored ${r.score.toLocaleString()} on Buzzer! Can you beat me?`
    try { if (navigator.share) await navigator.share({ title: 'Buzzer', text, url: location.origin }); else { await navigator.clipboard.writeText(`${text} ${location.origin}`); setNote('Copied! Paste it to a friend.') } } catch {}
  }
  const posted = r.mode === 'daily' ? 'today’s leaderboard' : 'the leaderboard'

  return (
    <div>
      {accuracy >= 70 && Array.from({ length: 36 }, (_, i) => <span key={i} aria-hidden="true" className="confetti" style={{ left: `${(i * 37) % 100}%`, background: colors[i % 4], animationDuration: `${2.5 + (i % 5) * 0.5}s`, animationDelay: `${(i % 7) * 0.15}s`, borderRadius: i % 3 ? 2 : 8 }} />)}
      <Header />
      <main className="max-w-3xl mx-auto px-5 pb-12">
        <div className="panel overflow-hidden text-center">
          <div className="bulbs" />
          <div className="p-8">
            <div className="flex justify-center"><Mascot kind={prof.mascot} mood={accuracy >= 60 ? 'happy' : 'sad'} size={110} /></div>
            <p className="display text-2xl" style={{ color: 'var(--p)' }}>{r.mode === 'daily' ? 'Daily challenge: ' : ''}{rating(accuracy)}</p>
            <p className="display text-[clamp(4.5rem,18vw,9rem)] tabular-nums pop" style={{ color: 'var(--y)', textShadow: '0 6px 0 var(--dk)' }}>{r.score.toLocaleString()}</p>
            {isBest && <p className="display text-xl pop" style={{ color: 'var(--l)' }}>New personal best!</p>}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[[`${r.correct} of ${r.total}`, 'Correct'], [`${accuracy}%`, 'Accuracy'], [r.bestStreak, 'Best streak']].map(([v, l]) => <div key={l} className="rounded-xl border-4 border-[var(--dk)] py-3" style={{ background: 'var(--deep)' }}><b className="display text-2xl block">{v}</b><span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>{l}</span></div>)}
            </div>
            <div className="mt-6 text-left rounded-xl border-4 border-[var(--dk)] p-4" style={{ background: 'var(--deep)' }}>
              <p className="font-extrabold flex justify-between"><span>+{r.xp} XP</span><span>Level {lp.level}</span></p>
              <div className="h-4 rounded-full border-2 border-[var(--dk)] overflow-hidden bg-[var(--card)] mt-2"><div className="h-full" style={{ width: `${(lp.into / lp.need) * 100}%`, background: 'var(--l)' }} /></div>
            </div>
            {r.badges?.length > 0 && <div className="mt-5 flex flex-wrap justify-center gap-3">{r.badges.map((id) => { const b = BADGES.find((x) => x.id === id); return <span key={id} className="pop px-4 py-2 rounded-full border-4 border-[var(--dk)] font-extrabold" style={{ background: 'var(--y)', color: 'var(--dk)' }}>New badge: {b?.name}</span> })}</div>}
            <p className="mt-5 font-semibold text-sm" style={{ color: 'var(--muted)' }}>
              {r.kids ? 'Kids zone scores stay on this device.' : r.submit === 'ok' ? `Your score is on ${posted}.` : r.submit ? `Couldn’t post your score: ${r.submit}` : r.mode === 'daily' ? 'This was a practice round, or you are not logged in, so it was not posted.' : 'Log in from your profile to post scores to the leaderboard.'}
            </p>
          </div>
          <div className="bulbs" />
        </div>
        <div className="flex flex-wrap gap-4 mt-8 justify-center"><Link to="/play" className="btn btn-pink text-xl">Play again</Link><Link to="/leaderboard" className="btn text-xl">Leaderboard</Link><button onClick={share} className="btn text-xl flex items-center gap-2"><Share2 size={20} />Share</button></div>
        <p role="status" className="text-center mt-3 font-bold min-h-6">{note}</p>
        <h2 className="display text-3xl mt-10 mb-4">Round review</h2>
        <ol className="space-y-3">
          {r.questions.map((q, i) => {
            const l = r.log[i]
            return (
              <li key={i} className="panel p-4 flex gap-3">
                <span className="mt-0.5 shrink-0">{l.skipped ? <SkipForward size={22} /> : l.ok ? <Check size={22} strokeWidth={4} color="#7dff4f" /> : <X size={22} strokeWidth={4} color="#ff2e93" />}</span>
                <div className="flex-1"><p className="font-bold">{q.text}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{l.skipped ? `Skipped. Answer: ${q.answers[q.correct]}` : l.ok ? `${q.answers[q.correct]}` : `You said ${l.pick === null ? 'nothing (time ran out)' : q.answers[l.pick]}. Answer: ${q.answers[q.correct]}`}</p></div>
                {l.pts > 0 && <b className="display text-lg" style={{ color: 'var(--y)' }}>+{l.pts}</b>}
              </li>
            )
          })}
        </ol>
      </main>
    </div>
  )
}
