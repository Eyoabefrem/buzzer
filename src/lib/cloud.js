import { supabase } from './supabase'
import { todayUTC } from './game.js'

// Everything Buzzer stores in Supabase: nicknames, leaderboard scores. Row-level security guards it (see supabase/schema.sql).
const must = ({ data, error }) => { if (error) throw new Error(error.message); return data }
export const saveProfile = async (id, { name, mascot }) => must(await supabase.from('profiles').upsert({ id, name: name.trim().slice(0, 16), mascot }))
export const submitScore = async (g) => must(await supabase.from('scores').insert({ mode: g.mode, score: g.score, correct: g.correct, total: g.total, best_streak: g.bestStreak, category: g.category || null }))
export const topAllTime = async () => must(await supabase.from('leaderboard_alltime').select('*').limit(25))
export const topToday = async () => must(await supabase.from('leaderboard_daily').select('*').limit(25))
export const myDailyToday = async (userId) => must(await supabase.from('scores').select('score').eq('user_id', userId).eq('mode', 'daily').eq('day', todayUTC()).maybeSingle())
