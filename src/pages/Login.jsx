import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Mascot from '../components/Mascot'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { sendCode, verifyCode } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('Enter a valid email address.')
    setBusy(true); setErr(''); const m = await sendCode(email.trim()); setBusy(false); m ? setErr(m) : setSent(true)
  }
  const verify = async (e) => { e.preventDefault(); setBusy(true); setErr(''); const m = await verifyCode(email.trim(), code.trim()); setBusy(false); m ? setErr(m) : nav('/profile') }
  return (
    <div>
      <Header />
      <main className="max-w-md mx-auto px-5 pb-12 text-center">
        <Mascot kind="pip" mood={sent ? 'happy' : 'idle'} size={110} className="mx-auto" />
        <h1 className="display text-3xl sm:text-4xl mt-2">{sent ? 'Check your email' : 'Join the leaderboard'}</h1>
        <p className="mt-3 text-lg" style={{ color: 'var(--muted)' }}>{sent ? `We sent a code to ${email.trim()}.` : 'Grown-ups: enter your email and we’ll send a code. No password needed. Kids can play without logging in.'}</p>
        {!sent ? (
          <form onSubmit={send} className="mt-6 space-y-4 text-left">
            <label className="block font-extrabold">Email<input type="email" className="field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus /></label>
            {err && <p role="alert" className="font-bold" style={{ color: 'var(--p)' }}>{err}</p>}
            <button disabled={busy} className="btn w-full">{busy ? 'Sending' : 'Send code'}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-6 space-y-4 text-left">
            <label className="block font-extrabold">Code<input className="field mt-1 text-center !text-3xl tracking-[.3em]" inputMode="numeric" maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus /></label>
            {err && <p role="alert" className="font-bold" style={{ color: 'var(--p)' }}>{err}</p>}
            <button disabled={busy || code.length < 6} className="btn w-full">{busy ? 'Checking' : 'Verify and continue'}</button>
            <button type="button" onClick={() => { setSent(false); setCode(''); setErr('') }} className="w-full font-bold underline underline-offset-4 py-2">Use a different email</button>
          </form>
        )}
      </main>
    </div>
  )
}
