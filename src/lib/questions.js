import { buildQuestion, pickFromBank } from './game'

export const CATEGORIES = [
  { id: 0, name: 'Anything goes' }, { id: 9, name: 'General knowledge' }, { id: 17, name: 'Science and nature' },
  { id: 22, name: 'Geography' }, { id: 23, name: 'History' }, { id: 21, name: 'Sports' },
  { id: 11, name: 'Film' }, { id: 15, name: 'Video games' }, { id: 27, name: 'Animals' },
]

// Try the Open Trivia Database (free, CC BY-SA 4.0). If it is busy, slow, or offline, use the built-in bank.
export async function loadQuestions({ category, difficulty, amount }) {
  try {
    const u = new URL('https://opentdb.com/api.php')
    u.searchParams.set('amount', amount); u.searchParams.set('type', 'multiple'); u.searchParams.set('encode', 'url3986')
    if (category) u.searchParams.set('category', category)
    if (difficulty !== 'mixed') u.searchParams.set('difficulty', difficulty)
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 7000)
    const j = await (await fetch(u, { signal: ctl.signal })).json()
    clearTimeout(timer)
    // code 0 = success. Code 5 = too many requests (one per 5 seconds per visitor).
    if (j.response_code === 0 && j.results?.length >= Math.min(amount, 5)) return { source: 'online', questions: j.results.map((r) => buildQuestion(r, { encoded: true })) }
  } catch { /* fall through to the offline bank */ }
  return { source: 'offline', questions: pickFromBank({ category, difficulty, amount }) }
}
