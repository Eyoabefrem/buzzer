// Live party rooms. The host's browser is the referee: everyone sends answers to the host, who scores them and shares the results.
// Pure functions, tested in room.test.js.
import { score, timeLimit } from './game.js'

export const roomCode = (rng = Math.random) => Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(rng() * 23)]).join('') // no I, L or O
export const newRoom = (questions = [], bonus = 0) => ({ questions, bonus, i: -1, phase: 'lobby', players: {}, answers: {}, results: [], startedAt: 0, limit: 0 })
export const addPlayer = (r, p) => (r.players[p.id] ? r : { ...r, players: { ...r.players, [p.id]: { id: p.id, name: p.name, mascot: p.mascot, score: 0, streak: 0 } } })
export function startQuestion(r, now) {
  const i = r.i + 1
  if (i >= r.questions.length) return { ...r, i, phase: 'end' }
  return { ...r, i, phase: 'ask', answers: {}, results: [], startedAt: now, limit: timeLimit(r.questions[i].difficulty) + r.bonus }
}
// A player can answer each question once. Late, repeated or unknown answers are ignored.
export const submitAnswer = (r, { id, i, pick }, now) => (r.phase !== 'ask' || i !== r.i || !r.players[id] || r.answers[id] ? r : { ...r, answers: { ...r.answers, [id]: { pick, elapsed: now - r.startedAt } } })
export const everyoneAnswered = (r) => Object.keys(r.players).length > 0 && Object.keys(r.players).every((id) => r.answers[id])
export function reveal(r) {
  const q = r.questions[r.i], players = { ...r.players }, results = []
  for (const id of Object.keys(players)) {
    const a = r.answers[id], p = players[id], ok = !!a && a.pick === q.correct, streak = ok ? p.streak + 1 : 0
    const pts = ok ? score({ difficulty: q.difficulty, timeLeft: Math.max(0, r.limit - a.elapsed / 1000), limit: r.limit, streak }) : 0
    players[id] = { ...p, streak, score: p.score + pts }
    results.push({ id, name: p.name, pick: a ? a.pick : null, ok, pts })
  }
  return { ...r, phase: 'reveal', players, results }
}
export const standings = (r) => Object.values(r.players).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
export const resetRoom = (r) => ({ ...newRoom([], r.bonus), players: Object.fromEntries(Object.values(r.players).map((p) => [p.id, { ...p, score: 0, streak: 0 }])) })

// What players are allowed to see. The right answer is only shared at reveal time.
export function view(r) {
  const q = r.questions[r.i]
  return {
    phase: r.phase, i: r.i, total: r.questions.length, players: standings(r), answered: Object.keys(r.answers).length,
    q: q && r.phase !== 'lobby' && r.phase !== 'end' ? { text: q.text, answers: q.answers, category: q.category, difficulty: q.difficulty, limit: r.limit } : null,
    reveal: q && r.phase === 'reveal' ? { correct: q.correct, results: r.results } : null,
  }
}
