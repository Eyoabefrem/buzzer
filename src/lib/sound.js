// Tiny synthesized sound effects. Browsers only allow sound after a tap, so call unlock() from a button.
let ctx
const KEY = 'buzzer-sound'
export const soundOn = () => { try { return localStorage.getItem(KEY) !== 'off' } catch { return true } }
export const setSound = (on) => { try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch {} }
export const unlock = () => { try { ctx ||= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume?.() } catch {} }
function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination)
  const t = ctx.currentTime + start
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.start(t); o.stop(t + dur)
}
export function play(kind) {
  if (!ctx || !soundOn()) return
  try {
    if (kind === 'right') { tone(660, 0, 0.15); tone(880, 0.12, 0.25); tone(1320, 0.26, 0.3) }
    if (kind === 'wrong') { tone(180, 0, 0.45, 'sawtooth', 0.2); tone(140, 0.05, 0.45, 'square', 0.12) }
    if (kind === 'tick') tone(1000, 0, 0.05, 'square', 0.06)
    if (kind === 'go') { tone(523, 0, 0.12); tone(784, 0.12, 0.3) }
  } catch {}
}
