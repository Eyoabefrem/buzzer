import { Link } from 'react-router-dom'
import { Dices, Lock } from 'lucide-react'
import Header from '../components/Header'
import Mascot, { MASCOTS } from '../components/Mascot'
import { useProfile, rollName } from '../lib/profile'
import { useAuth } from '../lib/auth'
import { configured } from '../lib/supabase'
import { getHistory } from '../lib/history'
import { BADGES, earned, totalXp, levelProgress } from '../lib/xp'

export default function Profile() {
  const prof = useProfile()
  const { user, logout } = useAuth()
  const h = getHistory(), got = earned(h), lp = levelProgress(totalXp(h))
  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-5 pb-12">
        <h1 className="display text-4xl sm:text-6xl">Your crew</h1>
        <section className="panel p-6 mt-6 flex flex-wrap items-center gap-6">
          <Mascot kind={prof.mascot} size={110} />
          <div className="flex-1 min-w-52">
            <label className="font-extrabold">Nickname<div className="flex gap-2 mt-1"><input className="field" maxLength={16} value={prof.name} onChange={(e) => prof.update({ name: e.target.value })} aria-label="Nickname" />
              <button onClick={() => prof.update({ name: rollName() })} aria-label="Roll a new nickname" className="btn !px-3"><Dices /></button></div></label>
            <p className="font-extrabold mt-4">Level {lp.level}, {lp.into} of {lp.need} XP to the next</p>
            <div className="h-4 rounded-full border-2 border-[var(--dk)] overflow-hidden bg-[var(--deep)] mt-1"><div className="h-full" style={{ width: `${(lp.into / lp.need) * 100}%`, background: 'var(--l)' }} /></div>
          </div>
        </section>
        <h2 className="display text-2xl mt-10 mb-3">Pick your mascot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MASCOTS.map(([k, n]) => <button key={k} onClick={() => prof.update({ mascot: k })} aria-pressed={prof.mascot === k} className="panel py-4 flex flex-col items-center" style={prof.mascot === k ? { outline: '5px solid var(--p)', outlineOffset: 3 } : {}}><Mascot kind={k} mood={prof.mascot === k ? 'happy' : 'idle'} size={90} /><b className="display text-lg mt-1">{n}</b></button>)}
        </div>
        <h2 className="display text-2xl mt-10 mb-3">Badges ({got.length} of {BADGES.length})</h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {BADGES.map((b) => { const on = got.includes(b.id); return <li key={b.id} className="panel p-4 flex items-center gap-3" style={{ opacity: on ? 1 : 0.55 }}><span className="grid place-items-center size-12 rounded-full border-4 border-[var(--dk)]" style={{ background: on ? 'var(--y)' : 'var(--deep)', color: on ? 'var(--dk)' : 'var(--ink)' }}>{on ? '★' : <Lock size={18} />}</span><span><b className="block">{b.name}</b><span className="text-sm" style={{ color: 'var(--muted)' }}>{b.desc}</span></span></li> })}
        </ul>
        <h2 className="display text-2xl mt-10 mb-3">Account</h2>
        <div className="panel p-5 flex flex-wrap items-center justify-between gap-4">
          {!configured ? <p className="font-semibold">Accounts are not set up. Add your Supabase keys to turn on the leaderboard and daily rankings.</p>
            : user ? <><p className="font-semibold">Signed in as {user.email}</p><button onClick={logout} className="btn !py-2">Log out</button></>
            : <><p className="font-semibold">Log in to post scores to the leaderboard.</p><Link to="/login" className="btn !py-2">Log in</Link></>}
        </div>
        <p className="mt-6 text-sm" style={{ color: 'var(--muted)' }}>Levels, badges and stats stay on this device. <Link to="/stats" className="underline underline-offset-4">See your stats</Link>. Kids zone profiles are never uploaded.</p>
      </main>
    </div>
  )
}
