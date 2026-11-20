import assert from 'node:assert/strict'
import { summarize } from './history.js'

const h = [
  { score: 900, correct: 6, total: 10, bestStreak: 3, categories: { Geography: { correct: 4, total: 5 }, History: { correct: 2, total: 5 } } },
  { score: 1500, correct: 9, total: 10, bestStreak: 7, categories: { Geography: { correct: 5, total: 5 }, Sports: { correct: 4, total: 5 } } },
]
const s = summarize(h)
assert.equal(s.games, 2); assert.equal(s.best, 1500); assert.equal(s.bestStreak, 7); assert.equal(s.accuracy, 75)
assert.deepEqual(s.byCategory[0], { category: 'Geography', correct: 9, total: 10, accuracy: 90 }, 'busiest category first')
assert.equal(s.byCategory.find((c) => c.category === 'History').accuracy, 40)
assert.deepEqual(summarize([]), { games: 0, best: 0, bestStreak: 0, accuracy: 0, byCategory: [] }, 'empty history')
console.log('History tests passed')
