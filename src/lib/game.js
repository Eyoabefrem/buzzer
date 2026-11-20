// The rules of Buzzer. Pure functions: no screens, no network. Tested in game.test.js.
export const BASE = { easy: 100, medium: 200, hard: 300 }
export const timeLimit = (d) => ({ easy: 20, medium: 25, hard: 30 })[d] || 25
export const multiplier = (streak) => (streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1)
// Base points for the difficulty, doubled by answering instantly, then multiplied by the streak.
export const score = ({ difficulty, timeLeft, limit, streak }) =>
  Math.round((BASE[difficulty] || 200) * (1 + Math.max(0, Math.min(1, timeLeft / limit))) * multiplier(streak))

export function shuffle(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
// raw = { category, difficulty, question, correct_answer, incorrect_answers }. The online service sends url-encoded text.
export function buildQuestion(raw, { encoded = false, rng = Math.random } = {}) {
  const d = (s) => (encoded ? decodeURIComponent(s) : s)
  const correct = d(raw.correct_answer)
  const answers = shuffle([correct, ...raw.incorrect_answers.map(d)], rng)
  return { text: d(raw.question), category: d(raw.category), difficulty: raw.difficulty, answers, correct: answers.indexOf(correct) }
}
// 50:50 hides two wrong answers, never the right one.
export const fiftyFifty = (q, rng = Math.random) => shuffle(q.answers.map((_, i) => i).filter((i) => i !== q.correct), rng).slice(0, 2)

export const rating = (accuracy) => accuracy >= 90 ? 'Quiz master' : accuracy >= 70 ? 'Show stopper' : accuracy >= 50 ? 'Crowd favorite' : accuracy >= 30 ? 'Warming up' : 'Better luck next round'

// ---- A game in progress ----
export const initGame = (questions, opts = {}) => ({
  questions, i: 0, score: 0, streak: 0, best: 0, log: [], picked: null, lastPts: 0, phase: 'ask',
  hidden: [], life: { fifty: true, time: true, skip: true }, bonus: opts.bonus || 0, limit: timeLimit(questions[0].difficulty) + (opts.bonus || 0),
})
const advance = (s) => {
  const i = s.i + 1
  if (i >= s.questions.length) return { ...s, phase: 'done' }
  return { ...s, i, phase: 'ask', picked: null, hidden: [], lastPts: 0, limit: timeLimit(s.questions[i].difficulty) + s.bonus }
}
export function reduce(s, a) {
  if (a.type === 'next') return s.phase === 'reveal' ? advance(s) : s
  if (s.phase !== 'ask') return s
  const q = s.questions[s.i]
  switch (a.type) {
    case 'answer': case 'timeout': {
      const pick = a.type === 'answer' ? a.pick : null
      const ok = pick === q.correct
      const streak = ok ? s.streak + 1 : 0
      const pts = ok ? score({ difficulty: q.difficulty, timeLeft: a.timeLeft, limit: s.limit, streak }) : 0
      return { ...s, phase: 'reveal', picked: pick, streak, best: Math.max(s.best, streak), score: s.score + pts, lastPts: pts, log: [...s.log, { pick, ok, pts, skipped: false }] }
    }
    case 'skip': // skipping costs nothing but earns nothing, and keeps your streak alive
      return s.life.skip ? advance({ ...s, life: { ...s.life, skip: false }, log: [...s.log, { pick: null, ok: false, pts: 0, skipped: true }] }) : s
    case 'fifty': return s.life.fifty ? { ...s, hidden: a.hide, life: { ...s.life, fifty: false } } : s
    case 'time': return s.life.time ? { ...s, limit: s.limit + 10, life: { ...s.life, time: false } } : s
    default: return s
  }
}

// ---- Offline questions ----
// Used when the online service is busy or you have no connection. [category id, difficulty, question, right answer, 3 wrong answers]
const BANK = [
  [9, 'easy', 'What color do you get by mixing blue and yellow?', 'Green', 'Purple', 'Orange', 'Brown'],
  [9, 'easy', 'How many days are in a leap year?', '366', '365', '364', '367'],
  [9, 'medium', 'How many keys are on a standard piano?', '88', '76', '92', '100'],
  [9, 'medium', 'Which language has the most native speakers in the world?', 'Mandarin Chinese', 'English', 'Spanish', 'Hindi'],
  [9, 'hard', 'Which letter appears in no US state name?', 'Q', 'X', 'Z', 'J'],
  [9, 'hard', 'Which country has the most time zones, counting its overseas territories?', 'France', 'Russia', 'United States', 'United Kingdom'],
  [17, 'easy', 'Which gas do plants take in for photosynthesis?', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
  [17, 'easy', 'What is H2O more commonly called?', 'Water', 'Air', 'Salt', 'Sugar'],
  [17, 'medium', 'What is the chemical symbol for gold?', 'Au', 'Ag', 'Gd', 'Go'],
  [17, 'medium', 'What is the hardest natural substance on Earth?', 'Diamond', 'Quartz', 'Granite', 'Iron'],
  [17, 'hard', 'About how fast does light travel in a vacuum?', '300,000 km per second', '150,000 km per second', '30,000 km per second', '3,000,000 km per second'],
  [17, 'hard', 'Which blood type is the universal donor for red blood cells?', 'O negative', 'AB positive', 'A negative', 'B negative'],
  [22, 'easy', 'What is the capital of Ethiopia?', 'Addis Ababa', 'Nairobi', 'Khartoum', 'Asmara'],
  [22, 'easy', 'Which is the largest country in the world by area?', 'Russia', 'Canada', 'China', 'United States'],
  [22, 'medium', 'What is the capital of Australia?', 'Canberra', 'Sydney', 'Melbourne', 'Perth'],
  [22, 'medium', 'Which river is traditionally considered the longest in Africa?', 'The Nile', 'The Congo', 'The Niger', 'The Zambezi'],
  [22, 'hard', 'In which country is the city of Timbuktu?', 'Mali', 'Niger', 'Chad', 'Mauritania'],
  [22, 'hard', 'What is the smallest country in the world by area?', 'Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'],
  [23, 'easy', 'Who was the first President of the United States?', 'George Washington', 'Abraham Lincoln', 'Thomas Jefferson', 'John Adams'],
  [23, 'easy', 'In which ancient city was the Parthenon built?', 'Athens', 'Rome', 'Sparta', 'Corinth'],
  [23, 'medium', 'In what year did World War II end?', '1945', '1939', '1943', '1947'],
  [23, 'medium', 'Who was the last emperor of Ethiopia?', 'Haile Selassie', 'Menelik II', 'Tewodros II', 'Yohannes IV'],
  [23, 'hard', 'In what year was the Battle of Adwa, where Ethiopia defeated Italy?', '1896', '1885', '1906', '1935'],
  [23, 'hard', 'In what year did the Berlin Wall fall?', '1989', '1987', '1991', '1985'],
  [21, 'easy', 'How many players are on the field for one soccer team?', '11', '9', '10', '12'],
  [21, 'easy', 'In which sport do players slam dunk?', 'Basketball', 'Volleyball', 'Tennis', 'Rugby'],
  [21, 'medium', 'How often are the Summer Olympic Games held?', 'Every 4 years', 'Every 2 years', 'Every 3 years', 'Every 5 years'],
  [21, 'medium', 'Which country has won the most FIFA World Cup titles?', 'Brazil', 'Germany', 'Italy', 'Argentina'],
  [21, 'hard', 'Which Ethiopian runner won the 1960 Olympic marathon in Rome, running barefoot?', 'Abebe Bikila', 'Haile Gebrselassie', 'Kenenisa Bekele', 'Derartu Tulu'],
  [21, 'hard', 'Which city hosted the 2016 Summer Olympics?', 'Rio de Janeiro', 'London', 'Tokyo', 'Beijing'],
  [11, 'easy', 'Which animated film features a clownfish named Nemo?', 'Finding Nemo', 'Moana', 'Shark Tale', 'Ratatouille'],
  [11, 'easy', 'What is the toy cowboy called in Toy Story?', 'Woody', 'Buzz', 'Rex', 'Slinky'],
  [11, 'medium', 'Who directed the 1997 film Titanic?', 'James Cameron', 'Steven Spielberg', 'Ridley Scott', 'Christopher Nolan'],
  [11, 'medium', 'In The Lion King, what is Simba’s father called?', 'Mufasa', 'Scar', 'Nala', 'Rafiki'],
  [11, 'hard', 'Which film won the first Academy Award for Best Picture?', 'Wings', 'Sunrise', 'Metropolis', 'The Jazz Singer'],
  [11, 'hard', 'Who directed the 2019 film Parasite?', 'Bong Joon-ho', 'Park Chan-wook', 'Lee Chang-dong', 'Kim Ki-duk'],
]
const NAMES = { 9: 'General Knowledge', 17: 'Science & Nature', 22: 'Geography', 23: 'History', 21: 'Sports', 11: 'Entertainment: Film' }
export const BANK_CATEGORIES = Object.keys(NAMES).map(Number)

// Choose `amount` questions from the bank. Falls back to the whole bank if the filter is too narrow.
export function pickFromBank({ category, difficulty, amount }, rng = Math.random) {
  const rows = BANK.map(([c, d, q, a, ...w]) => ({ category: NAMES[c], cid: c, difficulty: d, question: q, correct_answer: a, incorrect_answers: w }))
  let pool = rows.filter((r) => (!category || r.cid === category) && (difficulty === 'mixed' || r.difficulty === difficulty))
  if (pool.length < amount) pool = [...pool, ...shuffle(rows.filter((r) => !pool.includes(r)), rng)]
  return shuffle(pool, rng).slice(0, amount).map((r) => buildQuestion(r, { rng }))
}

// ---- Daily challenge: the same ten questions for everyone on a given UTC day ----
export const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
export const todayUTC = () => new Date().toISOString().slice(0, 10)
export const dailyQuestions = (day) => pickFromBank({ category: 0, difficulty: 'mixed', amount: 10 }, mulberry32(hash('buzzer-' + day)))

// ---- Kids zone: hand-checked easy questions, used instead of the online service ----
// [category, question, right answer, 3 wrong answers]
const KIDS = [
  ['Animals', 'What sound does a cow make?', 'Moo', 'Woof', 'Meow', 'Quack'],
  ['Animals', 'Which animal is the tallest in the world?', 'Giraffe', 'Elephant', 'Horse', 'Camel'],
  ['Animals', 'What do bees make?', 'Honey', 'Milk', 'Bread', 'Silk'],
  ['Animals', 'Which animal has a long trunk?', 'Elephant', 'Lion', 'Zebra', 'Monkey'],
  ['Animals', 'What do we call a baby cat?', 'Kitten', 'Puppy', 'Cub', 'Chick'],
  ['Animals', 'Which of these is a bird that cannot fly?', 'Ostrich', 'Eagle', 'Parrot', 'Owl'],
  ['Space and science', 'What is the star at the center of our solar system?', 'The Sun', 'The Moon', 'Mars', 'Venus'],
  ['Space and science', 'How many planets are in our solar system?', '8', '7', '9', '10'],
  ['Space and science', 'What do plants need to grow?', 'Sunlight and water', 'Only candy', 'Only sand', 'Loud music'],
  ['Space and science', 'What do you get when ice melts?', 'Water', 'Sand', 'Milk', 'Smoke'],
  ['Space and science', 'What shape is the Earth?', 'A ball', 'Flat like a plate', 'A cube', 'A triangle'],
  ['Space and science', 'Which planet do we live on?', 'Earth', 'Mars', 'Jupiter', 'Saturn'],
  ['Our world', 'What is the capital of Ethiopia?', 'Addis Ababa', 'Nairobi', 'Khartoum', 'Asmara'],
  ['Our world', 'Which continent is Ethiopia in?', 'Africa', 'Asia', 'Europe', 'Australia'],
  ['Our world', 'How many colors are in a rainbow?', '7', '5', '6', '8'],
  ['Our world', 'Which grain is used to make injera?', 'Teff', 'Rice', 'Corn', 'Oats'],
  ['Our world', 'What falls from clouds when it rains?', 'Water', 'Sand', 'Leaves', 'Feathers'],
  ['Our world', 'Which is the biggest ocean?', 'The Pacific', 'The Atlantic', 'The Indian', 'The Arctic'],
  ['Food and body', 'How many fingers are on one hand?', '5', '4', '6', '10'],
  ['Food and body', 'Which part of your body do you use to see?', 'Eyes', 'Ears', 'Nose', 'Knees'],
  ['Food and body', 'Which fruit is yellow and curved?', 'Banana', 'Apple', 'Grape', 'Orange'],
  ['Food and body', 'What do you brush every day to keep clean?', 'Teeth', 'Knees', 'Shoes', 'Ears'],
  ['Food and body', 'Which food comes from cows?', 'Milk', 'Bread', 'Rice', 'Honey'],
  ['Food and body', 'Which of these is a vegetable?', 'Carrot', 'Cookie', 'Candy', 'Cake'],
]
export const KID_CATEGORIES = ['Animals', 'Space and science', 'Our world', 'Food and body']
export function pickKids({ category, amount }, rng = Math.random) {
  const rows = KIDS.map(([c, q, a, ...w]) => ({ category: c, difficulty: 'easy', question: q, correct_answer: a, incorrect_answers: w }))
  let pool = rows.filter((r) => !category || r.category === category)
  if (pool.length < amount) pool = [...pool, ...shuffle(rows.filter((r) => !pool.includes(r)), rng)]
  return shuffle(pool, rng).slice(0, amount).map((r) => buildQuestion(r, { rng }))
}
