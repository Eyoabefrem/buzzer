import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { SHADES } from '../components/Stage'
import { getHistory, clearHistory, summarize } from '../lib/history'

export default function Stats() {
  const [history, setHistory] = useState(getHistory)
  const s = summarize(history)
  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-5 pb-12">
        <h1 className="display text-4xl sm:text-6xl">Your stats</h1>
        {!history.length ? (
          <div className="panel p-10 mt-8 text-center"><p className="display text-3xl">No games yet</p><p className="mt-2" style={{ color: 'var(--muted)' }}>Play a round and your stats appear here.</p><Link to="/play" className="btn mt-6">Take the stage</Link></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[[s.games, 'Games'], [s.best.toLocaleString(), 'Best score'], [`${s.accuracy}%`, 'Accuracy'], [s.bestStreak, 'Best streak']].map(([v, l], i) => <div key={l} className="rounded-2xl border-4 border-[var(--dk)] p-4" style={{ background: SHADES[i], color: 'var(--dk)', boxShadow: '0 6px 0 var(--dk)' }}><b className="display text-3xl block">{v}</b><span className="font-bold">{l}</span></div>)}
            </div>
            <h2 className="display text-3xl mt-12 mb-4">By category</h2>
            <ul className="space-y-3">
              {s.byCategory.map((c) => (
                <li key={c.category} className="flex items-center gap-3">
                  <b className="w-40 shrink-0 text-sm sm:text-base">{c.category.replace('Entertainment: ', '')}</b>
                  <span className="flex-1 h-6 rounded-full border-4 border-[var(--dk)] overflow-hidden bg-[var(--card)]"><span className="block h-full" style={{ width: `${c.accuracy}%`, background: c.accuracy >= 70 ? 'var(--l)' : c.accuracy >= 40 ? 'var(--y)' : 'var(--p)' }} /></span>
                  <b className="w-24 text-right tabular-nums">{c.accuracy}% ({c.total})</b>
                </li>
              ))}
            </ul>
            <h2 className="display text-3xl mt-12 mb-4">Recent games</h2>
            <ul className="space-y-2">{history.slice(0, 10).map((g, i) => <li key={i} className="panel p-3 flex justify-between font-bold"><span>{new Date(g.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {g.correct} of {g.total} correct</span><span style={{ color: 'var(--y)' }}>{g.score.toLocaleString()}</span></li>)}</ul>
            <button onClick={() => confirm('Erase all your game history?') && (clearHistory(), setHistory([]))} className="mt-10 font-bold underline underline-offset-4">Erase my stats</button>
          </>
        )}
      </main>
    </div>
  )
}
