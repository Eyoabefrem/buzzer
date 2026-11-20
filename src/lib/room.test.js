import assert from 'node:assert/strict'
import { roomCode, newRoom, addPlayer, startQuestion, submitAnswer, everyoneAnswered, reveal, standings, resetRoom, view } from './room.js'

const mk = (d = 'easy') => ({ text: 'Q', category: 'c', difficulty: d, answers: ['a', 'b', 'c', 'd'], correct: 1 })
assert.ok(Array.from({ length: 300 }, () => roomCode()).every((c) => /^[A-HJ-KM-NP-Z]{4}$/.test(c)), 'codes avoid confusing letters')

let r = newRoom([mk(), mk()])
r = addPlayer(addPlayer(addPlayer(r, { id: 'a', name: 'Ana', mascot: 'zap' }), { id: 'b', name: 'Ben', mascot: 'pip' }), { id: 'a', name: 'Dup', mascot: 'rex' })
assert.equal(Object.keys(r.players).length, 2); assert.equal(r.players.a.name, 'Ana', 'joining twice keeps the first entry')
r = startQuestion(r, 1000)
assert.equal(r.phase, 'ask'); assert.equal(r.limit, 20)

assert.equal(submitAnswer(r, { id: 'zzz', i: 0, pick: 1 }, 1500), r, 'strangers cannot answer')
assert.equal(submitAnswer(r, { id: 'a', i: 5, pick: 1 }, 1500), r, 'answers to another question are ignored')
r = submitAnswer(r, { id: 'a', i: 0, pick: 1 }, 1000)
assert.equal(submitAnswer(r, { id: 'a', i: 0, pick: 2 }, 1200), r, 'only the first answer counts')
assert.equal(everyoneAnswered(r), false)
r = submitAnswer(r, { id: 'b', i: 0, pick: 0 }, 11000)
assert.equal(everyoneAnswered(r), true)

assert.equal(JSON.stringify(view(r)).includes('"correct"'), false, 'the answer stays hidden while players are answering')
r = reveal(r)
assert.equal(r.players.a.score, 200, 'instant right answer doubles the base')
assert.equal(r.players.b.score, 0); assert.equal(r.players.b.streak, 0)
assert.equal(view(r).reveal.correct, 1)
assert.deepEqual(standings(r).map((p) => p.name), ['Ana', 'Ben'])

r = startQuestion(r, 20000)
r = submitAnswer(r, { id: 'b', i: 1, pick: 1 }, 30000) // 10 of 20 seconds left
r = reveal(r)
assert.equal(r.players.b.score, 150, 'half the time left earns 1.5x the base')
assert.equal(r.players.a.score, 200, 'no answer scores nothing'); assert.equal(r.players.a.streak, 0, 'and breaks the streak')
assert.deepEqual(standings(r).map((p) => p.name), ['Ana', 'Ben'])
assert.equal(startQuestion(r, 1).phase, 'end', 'after the last question the room ends')
const again = resetRoom(startQuestion(r, 1))
assert.equal(again.phase, 'lobby'); assert.equal(again.players.a.score, 0); assert.equal(Object.keys(again.players).length, 2, 'everyone stays for a rematch')
assert.equal(startQuestion(addPlayer(newRoom([mk('hard')], 10), { id: 'x', name: 'X', mascot: 'zap' }), 0).limit, 40, 'kids bonus time')
console.log('Room tests passed')
