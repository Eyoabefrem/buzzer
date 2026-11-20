// Your games, saved in this browser. Phase 2 moves them to your account.
const KEY = 'buzzer-history'
export const getHistory = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
export const addGame = (g) => { const h = [g, ...getHistory()].slice(0, 200); try { localStorage.setItem(KEY, JSON.stringify(h)) } catch {} return h }
export const clearHistory = () => { try { localStorage.removeItem(KEY) } catch {} }

// game = { date, score, correct, total, bestStreak, categories: { 'Geography': { correct, total } } }
export function summarize(history) {
  const cats = new Map(); let correct = 0, total = 0
  for (const g of history) {
    correct += g.correct; total += g.total
    for (const [name, c] of Object.entries(g.categories || {})) { const x = cats.get(name) || { correct: 0, total: 0 }; x.correct += c.correct; x.total += c.total; cats.set(name, x) }
  }
  return {
    games: history.length, best: Math.max(0, ...history.map((g) => g.score)), bestStreak: Math.max(0, ...history.map((g) => g.bestStreak)),
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    byCategory: [...cats].map(([category, c]) => ({ category, ...c, accuracy: Math.round((c.correct / c.total) * 100) })).sort((a, b) => b.total - a.total),
  }
}
