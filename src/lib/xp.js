// Experience points, levels and badges. Pure functions, tested in xp.test.js.
export const xpFor = ({ score, correct, total }) => Math.round(score / 10) + correct * 5 + (total >= 5 && correct === total ? 50 : 0)
export const totalXp = (history) => history.reduce((t, g) => t + xpFor(g), 0)
export const levelStart = (n) => 40 * (n - 1) ** 2
export const levelFor = (xp) => 1 + Math.floor(Math.sqrt(xp / 40))
export function levelProgress(xp) { const level = levelFor(xp), a = levelStart(level), b = levelStart(level + 1); return { level, into: xp - a, need: b - a } }

export const context = (h) => ({
  games: h.length, totalCorrect: h.reduce((t, g) => t + g.correct, 0), bestStreak: Math.max(0, ...h.map((g) => g.bestStreak)),
  perfect: h.filter((g) => g.total >= 5 && g.correct === g.total).length,
  categories: new Set(h.flatMap((g) => Object.keys(g.categories || {}))).size,
  dailyDays: new Set(h.filter((g) => g.mode === 'daily').map((g) => g.day)).size,
})
export const BADGES = [
  { id: 'first', name: 'First buzz', desc: 'Finish your first game', test: (c) => c.games >= 1 },
  { id: 'regular', name: 'Regular', desc: 'Play 10 games', test: (c) => c.games >= 10 },
  { id: 'perfect', name: 'Perfect round', desc: 'Get every question right (5 or more)', test: (c) => c.perfect >= 1 },
  { id: 'streak5', name: 'On fire', desc: 'Answer 5 in a row', test: (c) => c.bestStreak >= 5 },
  { id: 'streak10', name: 'Unstoppable', desc: 'Answer 10 in a row', test: (c) => c.bestStreak >= 10 },
  { id: 'explorer', name: 'Explorer', desc: 'Answer questions from 5 categories', test: (c) => c.categories >= 5 },
  { id: 'daily3', name: 'Daily habit', desc: 'Play the daily challenge on 3 days', test: (c) => c.dailyDays >= 3 },
  { id: 'brain', name: 'Big brain', desc: 'Get 100 answers right', test: (c) => c.totalCorrect >= 100 },
]
export const earned = (history) => { const c = context(history); return BADGES.filter((b) => b.test(c)).map((b) => b.id) }
