import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Copy, LogOut } from 'lucide-react'
import Header from '../components/Header'
import Mascot from '../components/Mascot'
import { Credit, SHADES } from '../components/Stage'
import { useProfile } from '../lib/profile'
import { configured } from '../lib/supabase'
import { openRoom } from '../lib/realtime'
import { loadQuestions } from '../lib/questions'
import { pickKids } from '../lib/game'
import { roomCode, newRoom, addPlayer, startQuestion, submitAnswer, everyoneAnswered, reveal, resetRoom, view } from '../lib/room'
import { unlock, play } from '../lib/sound'

const newId = () => Math.random().toString(36).slice(2, 10)
const myId = () => { try { let id = sessionStorage.getItem('buzzer-pid'); if (!id) { id = newId(); sessionStorage.setItem('buzzer-pid', id) } return id } catch { return newId() } }

function Answers({ q, picked, correct, onPick }) {
  const rev = correct != null
  return (
    <div className="grid sm:grid-cols-2 gap-4 mt-6">
      {q.answers.map((a, i) => {
        const st = !rev ? '' : i === correct ? 'right' : i === picked ? 'wrong' : 'dim', mine = !rev && picked === i
        return (
          <button key={i} onClick={() => onPick?.(i)} disabled={rev || picked !== null} aria-label={`${'ABCD'[i]}: ${a}`}
            className={`rounded-2xl border-4 border-[var(--dk)] px-4 py-4 font-extrabold text-lg text-left flex items-center gap-3 transition-all ${st === 'wrong' ? 'shake' : ''}`}
            style={{ background: SHADES[i], color: 'var(--dk)', opacity: st === 'dim' || (picked !== null && !rev && !mine) ? 0.45 : 1, boxShadow: '0 6px 0 var(--dk)', outline: st === 'right' || mine ? '5px solid var(--ink)' : 'none', outlineOffset: 3 }}>
            <span className="grid place-items-center size-9 shrink-0 rounded-full bg-[var(--dk)] text-white">{'ABCD'[i]}</span><span className="flex-1">{a}</span>
          </button>
        )
      })}
    </div>
  )
}
const Board = ({ players, meId, n = 5 }) => (
  <ol className="space-y-2">{players.slice(0, n).map((p, i) => (
    <li key={p.id} className="panel p-2 flex items-center gap-3" style={p.id === meId ? { outline: '4px solid var(--p)', outlineOffset: 2 } : {}}>
      <b className="display w-6 text-center">{i + 1}</b><Mascot kind={p.mascot} size={36} className="!animate-none" /><b className="flex-1 truncate">{p.name}</b>
      <b className="display tabular-nums" style={{ color: 'var(--y)' }}>{p.score.toLocaleString()}</b>
    </li>))}</ol>
)
function Podium({ players }) {
  const H = ['h-44', 'h-32', 'h-24'], C = ['var(--y)', 'var(--c)', 'var(--p)']
  return (
    <div className="flex items-end justify-center gap-3 mt-8">
      {[1, 0, 2].filter((i) => players[i]).map((i) => { const p = players[i]; return (
        <div key={p.id} className="flex flex-col items-center w-28 sm:w-36">
          <Mascot kind={p.mascot} mood={i === 0 ? 'happy' : 'idle'} size={i === 0 ? 110 : 80} />
          <b className="truncate max-w-full">{p.name}</b><b className="display tabular-nums" style={{ color: 'var(--y)' }}>{p.score.toLocaleString()}</b>
          <div className={`${H[i]} w-full rounded-t-2xl border-4 border-[var(--dk)] display text-5xl grid place-items-center mt-2`} style={{ background: C[i], color: 'var(--dk)' }}>{i + 1}</div>
        </div>) })}
    </div>
  )
}

export default function Party() {
  const prof = useProfile()
  const me = useRef({ id: myId() }).current
  const [stage, setStage] = useState('menu')
  const [role, setRole] = useState(null)
  const [code, setCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [snap, setSnap] = useState(null)
  const [picked, setPicked] = useState(null)
  const [err, setErr] = useState('')
  const [hostGone, setHostGone] = useState(false)
  const [kidsRoom, setKidsRoom] = useState(prof.kids)
  const [amount, setAmount] = useState(10)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [qStart, setQStart] = useState(0)
  const [copied, setCopied] = useState(false)
  const conn = useRef(null), room = useRef(null), timer = useRef(null), seenHost = useRef(false)
  const meta = { name: prof.name || 'Player', mascot: prof.mascot }

  // ---- Host: the referee. Only the host's browser holds the answers and the scores. ----
  const publish = () => conn.current?.send({ t: 'snap', snap: view(room.current) })
  const doReveal = () => { if (room.current.phase !== 'ask') return; clearTimeout(timer.current); room.current = reveal(room.current); publish() }
  const nextQ = () => {
    clearTimeout(timer.current)
    room.current = startQuestion(room.current, Date.now()); publish()
    if (room.current.phase === 'ask') timer.current = setTimeout(doReveal, room.current.limit * 1000 + 600)
  }
  const start = async () => {
    setBusy(true); setErr('')
    const r = kidsRoom ? { questions: pickKids({ category: 0, amount }) } : await loadQuestions({ category: 0, difficulty: 'mixed', amount })
    room.current = { ...room.current, questions: r.questions }
    setBusy(false); nextQ()
  }
  const again = () => { room.current = resetRoom(room.current); publish() }
  const onMessage = (m) => {
    if (m.t === 'snap') setSnap(m.snap)
    if (!room.current) return // players have no room; only the host does
    if (m.t === 'join') { room.current = addPlayer(room.current, m.p); publish() }
    if (m.t === 'ans') { room.current = submitAnswer(room.current, m, Date.now()); everyoneAnswered(room.current) ? doReveal() : publish() }
  }

  const connect = (c, r) => {
    seenHost.current = false; setHostGone(false); setErr(''); setCode(c); setRole(r); setStage('room'); setSnap(null)
    conn.current = openRoom(c, me.id, { ...meta, role: r }, {
      onMessage,
      onPresence: (st) => { const here = Object.values(st).flat().some((x) => x.role === 'host'); if (here) seenHost.current = true; else if (seenHost.current) setHostGone(true) },
      onStatus: (s) => {
        if (s === 'SUBSCRIBED') { r === 'host' ? publish() : conn.current.send({ t: 'join', p: { ...me, ...meta } }) }
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setErr('Could not connect to the room. Check your internet and try again.')
      },
    })
  }
  const create = () => { unlock(); room.current = addPlayer(newRoom([], kidsRoom ? 10 : 0), { ...me, ...meta }); connect(roomCode(), 'host') }
  const join = () => {
    const c = joinCode.trim().toUpperCase()
    if (!/^[A-HJ-KM-NP-Z]{4}$/.test(c)) return setErr('Enter the 4-letter room code.')
    unlock(); connect(c, 'player')
  }
  const leave = () => { clearTimeout(timer.current); conn.current?.close(); conn.current = null; room.current = null; setStage('menu'); setSnap(null); setRole(null); setErr('') }
  const answer = (i) => { if (picked !== null) return; unlock(); setPicked(i); conn.current.send({ t: 'ans', id: me.id, i: snap.i, pick: i }) }
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }

  useEffect(() => () => { clearTimeout(timer.current); conn.current?.close() }, [])
  const asking = snap?.phase === 'ask'
  useEffect(() => { if (asking) { setPicked(null); setQStart(Date.now()); setNow(Date.now()) } }, [snap?.i, asking])
  useEffect(() => { if (!asking) return; const t = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(t) }, [asking])
  useEffect(() => { if (snap?.phase === 'reveal') { const r = snap.reveal.results.find((x) => x.id === me.id); if (r) play(r.ok ? 'right' : 'wrong') } }, [snap?.phase, snap?.i])

  const pill = (on) => `px-5 py-2.5 rounded-full border-4 border-[var(--dk)] font-extrabold ${on ? 'bg-[var(--y)] text-[var(--dk)]' : 'bg-[var(--card)]'}`
  const amHost = role === 'host', q = snap?.q, timeLeft = q ? Math.max(0, q.limit - (now - qStart) / 1000) : 0, frac = q ? Math.min(1, timeLeft / q.limit) : 0
  const myRes = snap?.reveal?.results.find((x) => x.id === me.id)
  const mood = snap?.phase === 'reveal' ? (myRes?.ok ? 'happy' : 'sad') : asking && timeLeft <= 5 ? 'panic' : 'idle'

  let body
  if (!configured) body = <div className="panel p-8 text-center"><Mascot kind="pip" mood="sad" size={100} className="mx-auto" /><p className="display text-3xl mt-2">Party rooms need a connection</p><p className="mt-2" style={{ color: 'var(--muted)' }}>Add your Supabase keys to .env to turn on live rooms. Solo and daily games work without them.</p><Link to="/play" className="btn mt-6">Play solo</Link></div>
  else if (stage === 'menu') body = (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="panel p-6"><h2 className="display text-3xl">Host a party</h2><p className="mt-1 font-semibold" style={{ color: 'var(--muted)' }}>You run the show. Friends join with a code.</p>
        <div className="flex flex-wrap gap-3 mt-5"><button onClick={() => setKidsRoom(true)} aria-pressed={kidsRoom} className={pill(kidsRoom)}>Kids (6 to 10)</button><button onClick={() => setKidsRoom(false)} aria-pressed={!kidsRoom} className={pill(!kidsRoom)}>Youth and up</button></div>
        <div className="flex flex-wrap gap-3 mt-4">{[5, 10, 15].map((n) => <button key={n} onClick={() => setAmount(n)} aria-pressed={amount === n} className={pill(amount === n)}>{n} questions</button>)}</div>
        <button onClick={create} className="btn btn-pink text-xl mt-6">Create room</button></section>
      <section className="panel p-6"><h2 className="display text-3xl">Join a party</h2><p className="mt-1 font-semibold" style={{ color: 'var(--muted)' }}>Ask the host for the 4-letter code.</p>
        <input className="field mt-5 text-center !text-4xl tracking-[.3em] uppercase" maxLength={4} value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && join()} placeholder="ABCD" aria-label="Room code" />
        <button onClick={join} className="btn text-xl mt-6">Join room</button></section>
      <p className="md:col-span-2 text-center font-semibold" style={{ color: 'var(--muted)' }}>You will play as <b>{prof.name}</b> with <b>{prof.mascot}</b>. <Link to="/profile" className="underline underline-offset-4">Change</Link></p>
      {err && <p role="alert" className="md:col-span-2 text-center font-bold" style={{ color: 'var(--p)' }}>{err}</p>}
    </div>
  )
  else if (hostGone) body = <div className="panel p-8 text-center"><Mascot kind="rex" mood="sad" size={100} className="mx-auto" /><p className="display text-3xl mt-2">The host left the room</p><button onClick={leave} className="btn mt-6">Back to Party</button></div>
  else if (!snap) body = <div className="panel p-8 text-center"><p className="display text-3xl pop">Connecting to room {code}</p>{err && <p role="alert" className="mt-3 font-bold" style={{ color: 'var(--p)' }}>{err}</p>}</div>
  else if (snap.phase === 'lobby') body = (
    <div className="text-center">
      <p className="font-extrabold text-lg">Room code</p>
      <button onClick={copy} aria-label={`Room code ${code.split('').join(' ')}, press to copy`} className="display text-[clamp(4rem,18vw,9rem)] tracking-[.15em] leading-none" style={{ color: 'var(--y)', textShadow: '0 6px 0 var(--dk)' }}>{code}</button>
      <p className="font-semibold flex items-center justify-center gap-2" style={{ color: 'var(--muted)' }}><Copy size={16} />{copied ? 'Copied!' : 'Tap the code to copy it'}. Friends open Party and tap Join.</p>
      <h2 className="display text-2xl mt-8">{snap.players.length} {snap.players.length === 1 ? 'player' : 'players'} in the room</h2>
      <div className="flex flex-wrap justify-center gap-5 mt-4">{snap.players.map((p, i) => <div key={p.id} className="flex flex-col items-center w-24"><Mascot kind={p.mascot} size={84} className="" /><b className="truncate max-w-full">{p.name}</b></div>)}</div>
      {amHost ? <><button onClick={start} disabled={busy} className="btn btn-pink text-2xl mt-8 !px-10">{busy ? 'Loading questions' : 'Start the show'}</button><p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>Wait until everyone has joined. You play too.</p></> : <p className="display text-2xl mt-8">Waiting for the host to start</p>}
    </div>
  )
  else if (snap.phase === 'ask' || snap.phase === 'reveal') body = (
    <div>
      <div className="flex items-center justify-between font-extrabold text-lg"><span>Question {snap.i + 1} of {snap.total}</span><span>{snap.answered} of {snap.players.length} answered</span></div>
      {asking && <div className="h-5 mt-3 rounded-full border-4 border-[var(--dk)] overflow-hidden bg-[var(--card)]" role="timer" aria-label={`${Math.ceil(timeLeft)} seconds left`}><div className="h-full" style={{ width: `${frac * 100}%`, background: frac > 0.5 ? 'var(--l)' : frac > 0.25 ? 'var(--y)' : 'var(--p)' }} /></div>}
      <div className="panel mt-5 overflow-hidden"><div className="bulbs" /><div className="p-6 flex items-start gap-4"><div className="flex-1"><p className="font-bold text-sm" style={{ color: 'var(--muted)' }}>{q.category}, {q.difficulty}</p><h1 className="display text-2xl sm:text-4xl mt-2 leading-tight">{q.text}</h1></div><Mascot kind={prof.mascot} mood={mood} size={80} className="shrink-0" /></div><div className="bulbs" /></div>
      <Answers q={q} picked={asking ? picked : myRes?.pick ?? null} correct={snap.reveal?.correct} onPick={answer} />
      {asking ? <p className="mt-6 font-extrabold text-center" aria-live="polite">{picked !== null ? 'Locked in! Waiting for the others.' : 'Pick fast. Quicker answers score more.'}</p> : (
        <div className="mt-8">
          <p className="display text-2xl text-center pop" style={{ color: myRes?.ok ? 'var(--l)' : 'var(--p)' }}>{myRes?.ok ? `Correct! +${myRes.pts}` : myRes?.pick == null ? 'No answer' : 'Not quite'}</p>
          <h2 className="display text-xl mt-6 mb-3">Scoreboard</h2><Board players={snap.players} meId={me.id} />
          <div className="text-center mt-6">{amHost ? <button onClick={nextQ} className="btn text-xl">{snap.i + 1 >= snap.total ? 'Final results' : 'Next question'}</button> : <p className="font-extrabold">Waiting for the host</p>}</div>
        </div>)}
    </div>
  )
  else body = (
    <div className="text-center">
      {Array.from({ length: 36 }, (_, i) => <span key={i} aria-hidden="true" className="confetti" style={{ left: `${(i * 37) % 100}%`, background: ['#ff2e93', '#ffd400', '#19d3ff', '#7dff4f'][i % 4], animationDuration: `${2.5 + (i % 5) * 0.5}s`, animationDelay: `${(i % 7) * 0.15}s`, borderRadius: i % 3 ? 2 : 8 }} />)}
      <h1 className="display text-4xl sm:text-6xl">And the winner is</h1>
      <p className="display text-3xl mt-2" style={{ color: 'var(--p)' }}>{snap.players[0]?.name}</p>
      <Podium players={snap.players} />
      <div className="mt-10 text-left max-w-md mx-auto"><Board players={snap.players} meId={me.id} n={20} /></div>
      <div className="flex flex-wrap justify-center gap-4 mt-8">{amHost && <button onClick={again} className="btn btn-pink text-xl">Play again</button>}<button onClick={leave} className="btn text-xl">Leave room</button></div>
    </div>
  )

  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-5 pb-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="display text-3xl sm:text-5xl">{stage === 'room' ? `Room ${code}` : 'Party rooms'}</h1>
          {stage === 'room' && <button onClick={leave} className="btn !py-2 !px-4 flex items-center gap-2 text-sm"><LogOut size={16} />Leave</button>}
        </div>
        {body}
      </main>
      <Credit />
    </div>
  )
}
