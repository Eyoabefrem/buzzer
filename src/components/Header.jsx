import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react'
import Logo from './Logo'
import Mascot from './Mascot'
import { soundOn, setSound } from '../lib/sound'
import { useProfile } from '../lib/profile'

const link = ({ isActive }) => `font-bold px-3 py-1.5 rounded-full ${isActive ? 'bg-[var(--p)] text-[var(--dk)]' : 'hover:bg-[var(--card)]'}`

export default function Header() {
  const prof = useProfile()
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'))
  const [snd, setSnd] = useState(soundOn)
  const toggleTheme = () => { const n = !light; document.documentElement.classList.toggle('light', n); try { localStorage.setItem('theme', n ? 'light' : 'dark') } catch {} setLight(n) }
  const toggleSound = () => { setSound(!snd); setSnd(!snd) }
  const icon = 'p-2 rounded-full border-[3px] border-[var(--line)] hover:bg-[var(--card)]'
  return (
    <header className="relative z-10 max-w-5xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-3">
      <Link to="/"><Logo /></Link>
      <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Main">
        <NavLink to="/play" className={link}>Play</NavLink>
        <NavLink to="/party" className={link}>Party</NavLink>
        <NavLink to="/leaderboard" className={link}>Board</NavLink>
        <NavLink to="/profile" aria-label="Your crew and profile" className="rounded-full hover:bg-[var(--card)] px-1"><Mascot kind={prof.mascot} size={34} className="!animate-none" /></NavLink>
        <button onClick={toggleSound} aria-label={snd ? 'Mute sound' : 'Turn sound on'} className={icon}>{snd ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button onClick={toggleTheme} aria-label="Switch theme" className={icon}>{light ? <Moon size={18} /> : <Sun size={18} />}</button>
      </nav>
    </header>
  )
}
