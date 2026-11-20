import assert from 'node:assert/strict'
import { score, multiplier, timeLimit, shuffle, buildQuestion, fiftyFifty, rating, initGame, reduce, pickFromBank, BANK_CATEGORIES, dailyQuestions, pickKids, KID_CATEGORIES } from './game.js'

const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

// scoring
assert.equal(score({ difficulty: 'easy', timeLeft: 0, limit: 20, streak: 1 }), 100, 'last-second answer earns the base')
assert.equal(score({ difficulty: 'easy', timeLeft: 20, limit: 20, streak: 1 }), 200, 'instant answer doubles it')
assert.equal(score({ difficulty: 'hard', timeLeft: 15, limit: 30, streak: 1 }), 450)
assert.equal(score({ difficulty: 'medium', timeLeft: 25, limit: 25, streak: 5 }), 800, 'a 5 streak doubles again')
assert.equal(score({ difficulty: 'easy', timeLeft: -3, limit: 20, streak: 1 }), 100, 'time never goes below zero')
assert.deepEqual([1, 2, 3, 4, 5, 9].map(multiplier), [1, 1, 1.5, 1.5, 2, 2])
assert.deepEqual(['easy', 'medium', 'hard'].map(timeLimit), [20, 25, 30])
assert.equal(rating(95), 'Quiz master'); assert.equal(rating(10), 'Better luck next round')

// shuffling and building questions
const rng = mulberry(7)
const s = shuffle([1, 2, 3, 4, 5, 6], rng)
assert.deepEqual([...s].sort(), [1, 2, 3, 4, 5, 6], 'shuffle keeps every item')
const q = buildQuestion({ category: 'Science%20%26%20Nature', difficulty: 'easy', question: 'What%27s%203%20%2B%203%3F', correct_answer: '6', incorrect_answers: ['5', '7', '9'] }, { encoded: true, rng })
assert.equal(q.text, "What's 3 + 3?"); assert.equal(q.category, 'Science & Nature')
assert.equal(q.answers[q.correct], '6', 'the correct index points at the correct answer')
for (let t = 0; t < 200; t++) { const h = fiftyFifty(q, mulberry(t)); assert.equal(h.length, 2); assert.ok(!h.includes(q.correct)); assert.notEqual(h[0], h[1]) }

// playing a game
const mk = (d) => ({ text: 'q', category: 'c', difficulty: d, answers: ['a', 'b', 'c', 'd'], correct: 1 })
let g = initGame([mk('easy'), mk('medium'), mk('hard')])
assert.equal(g.limit, 20)
g = reduce(g, { type: 'answer', pick: 1, timeLeft: 20 })
assert.equal(g.score, 200); assert.equal(g.streak, 1); assert.equal(g.phase, 'reveal')
assert.equal(reduce(g, { type: 'answer', pick: 1, timeLeft: 20 }), g, 'cannot answer twice')
g = reduce(g, { type: 'next' }); assert.equal(g.i, 1); assert.equal(g.limit, 25); assert.equal(g.picked, null)
g = reduce(g, { type: 'fifty', hide: [0, 2] }); assert.deepEqual(g.hidden, [0, 2]); assert.equal(g.life.fifty, false)
assert.equal(reduce(g, { type: 'fifty', hide: [0, 3] }).hidden[1], 2, 'each lifeline works once')
g = reduce(g, { type: 'time' }); assert.equal(g.limit, 35)
g = reduce(g, { type: 'answer', pick: 0, timeLeft: 10 })
assert.equal(g.streak, 0, 'a wrong answer breaks the streak'); assert.equal(g.score, 200); assert.equal(g.best, 1)
g = reduce(g, { type: 'next' })
g = reduce(g, { type: 'skip' }); assert.equal(g.phase, 'done'); assert.equal(g.log.at(-1).skipped, true)
const t = reduce(reduce(initGame([mk('easy'), mk('easy')]), { type: 'timeout' }), { type: 'next' })
assert.equal(t.log[0].ok, false); assert.equal(t.i, 1, 'timeout counts as a miss and moves on')
let k = initGame([mk('easy'), mk('easy'), mk('easy')])
k = reduce(k, { type: 'answer', pick: 1, timeLeft: 0 }); k = reduce(k, { type: 'next' })
k = reduce(k, { type: 'skip' })
assert.equal(k.streak, 1, 'skipping keeps the streak')

// offline bank
for (const category of [0, ...BANK_CATEGORIES]) for (const difficulty of ['mixed', 'easy', 'medium', 'hard']) {
  const qs = pickFromBank({ category, difficulty, amount: 10 }, mulberry(3))
  assert.equal(qs.length, 10, `${category} ${difficulty} fills ten`)
  assert.ok(qs.every((x) => x.answers.length === 4 && x.answers[x.correct] && new Set(x.answers).size === 4))
}
assert.ok(pickFromBank({ category: 22, difficulty: 'easy', amount: 2 }, mulberry(1)).every((x) => x.category === 'Geography' && x.difficulty === 'easy'))
// daily challenge: identical for everyone on the same day, different on another day
const d1 = dailyQuestions('2025-03-01'), d2 = dailyQuestions('2025-03-01'), d3 = dailyQuestions('2025-03-02')
assert.equal(d1.length, 10); assert.deepEqual(d1, d2, 'same day, same questions, same answer order')
assert.notDeepEqual(d1.map((x) => x.text), d3.map((x) => x.text), 'a new day brings new questions')
assert.equal(new Set(d1.map((x) => x.text)).size, 10, 'no repeats within a day')
// kids zone
for (const category of [0, ...KID_CATEGORIES]) {
  const ks = pickKids({ category, amount: 10 }, mulberry(5))
  assert.equal(ks.length, 10); assert.ok(ks.every((x) => x.difficulty === 'easy' && x.answers.length === 4 && new Set(x.answers).size === 4 && x.answers[x.correct]))
}
assert.ok(pickKids({ category: 'Animals', amount: 3 }, mulberry(2)).every((x) => x.category === 'Animals'))
// extra time for little players
const kg = initGame([mk('easy'), mk('easy')], { bonus: 10 })
assert.equal(kg.limit, 30); assert.equal(reduce(reduce(kg, { type: 'timeout' }), { type: 'next' }).limit, 30, 'bonus time carries to every question')
console.log('All game tests passed')
