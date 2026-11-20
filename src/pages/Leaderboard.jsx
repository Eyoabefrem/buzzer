import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Mascot from '../components/Mascot'
import { useAuth } from '../lib/auth'
import { configured } from '../lib/supabase'
import { topAllTime, topToday } from '../lib/cloud'

const MEDAL = ['var(--y)', '#d9d9e3', '#e0904f']

export default function Leaderboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('today')
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    if (!configured) return setRows([])
    setRows(null); setErr('')
    ;(tab === 'today' ? topToday : topAllTime)().then(setRows).catch((e) => { setErr(e.message); setRows([]) })
  }, [tab])
  const t = (on) => `px-5 py-2.5 rounded-full border-4 border-[var(--dk)] font-extrabold ${on ? 'bg-[var(--y)] text-[var(--dk)]' : 'bg-[var(--card)]'}`

  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-5 pb-12">
        <h1 className="display text-4xl sm:text-6xl">Leaderboard</h1>
        <div className="flex gap-3 mt-6"><button onClick={() => setTab('today')} className={t(tab === 'today')}>Today’s challenge</button><button onClick={() => setTab('all')} className={t(tab === 'all')}>All-time best</button></div>
        {err && <p role="alert" className="mt-4 font-bold" style={{ color: 'var(--p)' }}>{err}</p>}
        {rows === null ? <p className="mt-8" style={{ color: 'var(--muted)' }}>Loading</p> : !rows.length ? (
          <div className="panel p-10 mt-8 text-center"><p className="display text-3xl">{configured ? 'Nobody here yet' : 'The leaderboard needs accounts'}</p><p className="mt-2" style={{ color: 'var(--muted)' }}>{configured ? 'Be the first. Play and your score appears here.' : 'Add your Supabase keys to turn it on.'}</p><Link to="/play" className="btn mt-6">Take the stage</Link></div>
        ) : (
          <ol className="mt-8 space-y-3">
            {rows.map((r, i) => (
              <li key={r.user_id} className="panel p-3 flex items-center gap-4" style={r.user_id === user?.id ? { outline: '5px solid var(--p)', outlineOffset: 3 } : {}}>
                <span className="display grid place-items-center size-11 rounded-full border-4 border-[var(--dk)] text-xl" style={{ background: MEDAL[i] || 'var(--deep)', color: i < 3 ? 'var(--dk)' : 'var(--ink)' }}>{i + 1}</span>
                <Mascot kind={r.mascot} size={46} className="!animate-none" />
                <b className="flex-1 truncate text-lg">{r.name}{r.user_id === user?.id && ' (you)'}</b>
                <b className="display text-2xl tabular-nums" style={{ color: 'var(--y)' }}>{r.best.toLocaleString()}</b>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-8 text-sm" style={{ color: 'var(--muted)' }}>Scores are checked for plausibility, not proven. Kids zone scores are never posted.</p>
      </main>
    </div>
  )
}
