import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Globe, FlaskConical, Map, Landmark, Trophy, Clapperboard, Gamepad2, PawPrint, CalendarDays, Baby, Rocket, Utensils } from 'lucide-react'
import Header from '../components/Header'
import Mascot from '../components/Mascot'
import { Credit, SHADES } from '../components/Stage'
import { CATEGORIES } from '../lib/questions'
import { KID_CATEGORIES, todayUTC } from '../lib/game'
import { useProfile } from '../lib/profile'
import { useAuth } from '../lib/auth'
import { configured } from '../lib/supabase'
import { myDailyToday } from '../lib/cloud'
import { unlock } from '../lib/sound'

const ICONS = { 0: Sparkles, 9: Globe, 17: FlaskConical, 22: Map, 23: Landmark, 21: Trophy, 11: Clapperboard, 15: Gamepad2, 27: PawPrint, Animals: PawPrint, 'Space and science': Rocket, 'Our world': Globe, 'Food and body': Utensils }
const DIFFS = [['mixed', 'Mixed'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']]
const localDaily = () => { try { const d = JSON.parse(localStorage.getItem('buzzer-daily')); return d?.day === todayUTC() ? d.score : null } catch { return null } }

export default function Play() {
  const nav = useNavigate()
  const { state } = useLocation()
  const prof = useProfile()
  const { user } = useAuth()
  const [kids, setKids] = useState(state?.kids ?? prof.kids)
  const [category, setCategory] = useState(0)
  const [difficulty, setDifficulty] = useState('mixed')
  const [amount, setAmount] = useState(10)
  const [cloudDaily, setCloudDaily] = useState(undefined) // undefined = unknown, null = not played, number = score
  useEffect(() => { if (user && configured) myDailyToday(user.id).then((r) => setCloudDaily(r ? r.score : null)).catch(() => setCloudDaily(undefined)); else setCloudDaily(undefined) }, [user?.id])
  const played = cloudDaily ?? localDaily()
  const pill = (on) => `px-5 py-2.5 rounded-full border-4 border-[var(--dk)] font-extrabold ${on ? 'bg-[var(--y)] text-[var(--dk)]' : 'bg-[var(--card)]'}`
  const cats = kids ? [{ id: 0, name: 'Surprise me' }, ...KID_CATEGORIES.map((n) => ({ id: n, name: n }))] : CATEGORIES
  const pick = (k) => { setKids(k); setCategory(0); prof.update({ kids: k }) }
  const go = () => { unlock(); nav('/game', { state: { category, difficulty: kids ? 'easy' : difficulty, amount, kids } }) }
  const goDaily = () => { unlock(); nav('/game', { state: { daily: true, ranked: played == null } }) }

  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-5 pb-10">
        <div className="panel p-5 flex flex-wrap items-center gap-5" style={state?.daily ? { outline: '5px solid var(--p)', outlineOffset: 4 } : {}}>
          <Mascot kind={prof.mascot} size={84} />
          <div className="flex-1 min-w-48">
            <p className="display text-2xl flex items-center gap-2"><CalendarDays size={26} />Daily challenge</p>
            <p className="font-semibold" style={{ color: 'var(--muted)' }}>{played != null ? `Today you scored ${played.toLocaleString()}. Practice again, or come back tomorrow.` : 'Ten questions, the same for everyone today. One ranked try.'}</p>
            {!user && configured && <p className="text-sm font-bold mt-1" style={{ color: 'var(--p)' }}>Log in from your profile to post scores to the leaderboard.</p>}
          </div>
          <button onClick={goDaily} className="btn btn-pink">{played != null ? 'Practice' : 'Play today’s round'}</button>
        </div>

        <h1 className="display text-4xl sm:text-6xl mt-12">Choose your round</h1>
        <div className="flex flex-wrap gap-3 mt-6" role="group" aria-label="Who is playing">
          <button onClick={() => pick(true)} aria-pressed={kids} className={pill(kids)}><Baby size={18} className="inline mr-2 -mt-1" />Little champs (6 to 10)</button>
          <button onClick={() => pick(false)} aria-pressed={!kids} className={pill(!kids)}>Youth and grown-ups</button>
        </div>
        {kids && <p className="mt-3 font-semibold" style={{ color: 'var(--muted)' }}>Kids zone uses hand-checked easy questions, gives 10 extra seconds, and keeps scores on this device.</p>}
        <h2 className="display text-2xl mt-8 mb-4">Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cats.map((c, i) => {
            const Icon = ICONS[c.id] || Sparkles, on = category === c.id
            return (
              <button key={c.id} onClick={() => setCategory(c.id)} aria-pressed={on} className="rounded-2xl border-4 border-[var(--dk)] p-4 text-left font-extrabold text-lg flex items-center gap-3 transition-transform hover:-translate-y-1"
                style={{ background: on ? SHADES[i % 4] : 'var(--card)', color: on ? 'var(--dk)' : 'var(--ink)', boxShadow: on ? '0 6px 0 var(--dk)' : 'none', transform: on ? 'translateY(-3px)' : undefined }}>
                <Icon size={26} />{c.name}
              </button>
            )
          })}
        </div>
        <div className="grid sm:grid-cols-2 gap-8 mt-10">
          {!kids && <div><h2 className="display text-2xl mb-4">Difficulty</h2><div className="flex flex-wrap gap-3">{DIFFS.map(([k, l]) => <button key={k} onClick={() => setDifficulty(k)} aria-pressed={difficulty === k} className={pill(difficulty === k)}>{l}</button>)}</div></div>}
          <div><h2 className="display text-2xl mb-4">Questions</h2><div className="flex flex-wrap gap-3">{[5, 10, 15].map((n) => <button key={n} onClick={() => setAmount(n)} aria-pressed={amount === n} className={pill(amount === n)}>{n}</button>)}</div></div>
        </div>
        <button onClick={go} className="btn btn-pink text-2xl mt-12 !px-10">Take the stage</button>
      </main>
      <Credit />
    </div>
  )
}
