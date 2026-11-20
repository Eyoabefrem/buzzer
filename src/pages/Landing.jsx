import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CalendarDays, Users, Smile, Trophy, Star, HelpCircle, Sparkles } from 'lucide-react'
import Header from '../components/Header'
import Mascot, { MASCOTS } from '../components/Mascot'
import Burst from '../components/Burst'
import { Beams, Credit } from '../components/Stage'
import { useProfile } from '../lib/profile'
import { getHistory } from '../lib/history'
import { totalXp, levelProgress } from '../lib/xp'
import { unlock, play } from '../lib/sound'

const TILES = [
  { to: '/play', title: 'Solo show', tag: 'Beat the clock', color: 'var(--y)', Icon: Zap },
  { to: '/play', state: { daily: true }, title: 'Daily challenge', tag: 'Same questions for everyone', color: 'var(--c)', Icon: CalendarDays },
  { to: '/party', title: 'Party rooms', tag: 'Play live with friends', color: 'var(--p)', Icon: Users },
  { to: '/play', state: { kids: true }, title: 'Kids zone', tag: 'Friendly questions, extra time', color: 'var(--l)', Icon: Smile },
  { to: '/leaderboard', title: 'Leaderboard', tag: 'Who is on top?', color: 'var(--y)', Icon: Trophy },
  { to: '/profile', title: 'Your crew', tag: 'Mascots, badges and levels', color: 'var(--c)', Icon: Star },
]
const FLOATERS = [[HelpCircle, 8, 18, 44], [Star, 90, 14, 36], [Sparkles, 14, 62, 40], [Zap, 84, 58, 46], [HelpCircle, 50, 8, 34], [Star, 70, 78, 30], [Sparkles, 28, 86, 34], [HelpCircle, 94, 36, 30], [Zap, 4, 44, 32]]

export default function Landing() {
  const prof = useProfile()
  const lp = useMemo(() => levelProgress(totalXp(getHistory())), [])
  const [started, setStarted] = useState(() => { try { return sessionStorage.getItem('buzzer-started') === '1' } catch { return false } })
  const [burst, setBurst] = useState(0)
  const [moods, setMoods] = useState({})
  const press = () => {
    unlock(); play('right'); setBurst((b) => b + 1)
    setTimeout(() => { setStarted(true); try { sessionStorage.setItem('buzzer-started', '1') } catch {} }, 650)
  }
  const poke = (k) => { unlock(); play('right'); setMoods((m) => ({ ...m, [k]: 'happy' })); setTimeout(() => setMoods((m) => ({ ...m, [k]: 'idle' })), 1100) }

  return (
    <div className="relative overflow-hidden min-h-screen">
      <Beams />
      {FLOATERS.map(([Icon, x, y, s], i) => <span key={i} aria-hidden="true" className="bob absolute pointer-events-none opacity-30" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.4}s`, color: ['var(--y)', 'var(--c)', 'var(--p)', 'var(--l)'][i % 4] }}><Icon size={s} strokeWidth={3} /></span>)}
      <Header />

      <main className="relative max-w-5xl mx-auto px-5 pb-16 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }} className="panel inline-block overflow-hidden mt-4">
          <div className="bulbs" />
          <h1 className="display text-[clamp(3.5rem,15vw,9rem)] px-8 py-2" style={{ color: 'var(--y)', textShadow: '0 6px 0 var(--dk)' }}>Buzzer</h1>
          <div className="bulbs" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div key="start" exit={{ opacity: 0, scale: 0.8 }} className="mt-6">
              <p className="display text-2xl sm:text-3xl">Hit the buzzer to start the show</p>
              <div className="flex items-end justify-center gap-2 sm:gap-8 mt-4">
                <Mascot kind="zap" size={130} className="hidden sm:block" />
                <div className="relative">
                  <button onClick={press} aria-label="Press the buzzer to start" className="bigbuzz ring relative size-52 sm:size-64 rounded-full border-[6px] border-[var(--dk)] display text-4xl sm:text-5xl" style={{ color: '#fff', textShadow: '0 4px 0 #12082f' }}>Press</button>
                  {burst > 0 && <Burst key={burst} />}
                </div>
                <Mascot kind="pip" size={130} className="hidden sm:block" />
              </div>
              <p className="mt-10 font-semibold" style={{ color: 'var(--muted)' }}>For kids, teens and grown-ups. Solo, daily or live with friends.</p>
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="panel inline-flex items-center gap-4 pr-6 mt-6 text-left">
                <Mascot kind={prof.mascot} size={64} />
                <div><p className="display text-xl">{prof.name}</p><p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Level {lp.level}</p>
                  <div className="h-3 w-40 rounded-full border-2 border-[var(--dk)] overflow-hidden bg-[var(--deep)] mt-1"><div className="h-full" style={{ width: `${(lp.into / lp.need) * 100}%`, background: 'var(--l)' }} /></div></div>
              </div>
              <h2 className="display text-3xl sm:text-4xl mt-8">Choose your game</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 text-left">
                {TILES.map(({ to, state, title, tag, color, Icon }, i) => (
                  <motion.div key={title} initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 14 }} whileHover={{ y: -8, rotate: i % 2 ? -2 : 2 }} whileTap={{ scale: 0.96 }}>
                    <Link to={to} state={state} className="block rounded-3xl border-4 border-[var(--dk)] p-5 h-full" style={{ background: color, color: 'var(--dk)', boxShadow: '0 8px 0 var(--dk)' }}>
                      <Icon size={40} strokeWidth={3} /><p className="display text-2xl mt-3">{title}</p><p className="font-bold mt-1">{tag}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <h2 className="display text-3xl mt-16">Meet the crew</h2>
              <p className="font-semibold mt-1" style={{ color: 'var(--muted)' }}>Tap one to say hi</p>
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                {MASCOTS.map(([k, n]) => <button key={k} onClick={() => poke(k)} aria-label={`Say hi to ${n}`} className="flex flex-col items-center"><Mascot kind={k} mood={moods[k] || 'idle'} size={120} /><span className="display text-xl mt-1">{n}</span></button>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Credit />
    </div>
  )
}
