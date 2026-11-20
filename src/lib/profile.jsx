import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth'
import { saveProfile } from './cloud'

// Who is playing: nickname, mascot, and whether it is kids mode. Saved on this device.
// Kids mode profiles are never uploaded.
const Ctx = createContext(null)
const KEY = 'buzzer-profile'
const ADJ = ['Swift', 'Brave', 'Sunny', 'Clever', 'Mighty', 'Zippy', 'Lucky', 'Cosmic']
const ANI = ['Lion', 'Zebra', 'Falcon', 'Gazelle', 'Panda', 'Otter', 'Tiger', 'Comet']
export const rollName = (rng = Math.random) => `${ADJ[Math.floor(rng() * ADJ.length)]} ${ANI[Math.floor(rng() * ANI.length)]}`

export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [p, setP] = useState(() => { try { return { name: '', mascot: 'zap', kids: false, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return { name: '', mascot: 'zap', kids: false } } })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(p)) } catch {} }, [p])
  useEffect(() => { if (!p.name) setP((x) => ({ ...x, name: rollName() })) }, [])
  useEffect(() => { if (user && p.name && !p.kids) saveProfile(user.id, p).catch(() => {}) }, [user?.id])
  const update = (patch) => { const n = { ...p, ...patch }; setP(n); if (user && !n.kids && n.name.trim()) saveProfile(user.id, n).catch(() => {}) }
  return <Ctx.Provider value={{ ...p, update }}>{children}</Ctx.Provider>
}
export const useProfile = () => useContext(Ctx)
