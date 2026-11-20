import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titles = { '/play': 'Choose your round', '/game': 'On air', '/results': 'Results', '/stats': 'Your stats', '/party': 'Party rooms', '/leaderboard': 'Leaderboard', '/profile': 'Your crew', '/login': 'Log in' }
export default function Titles() {
  const { pathname } = useLocation()
  useEffect(() => { const p = pathname.replace(/\/$/, '') || '/'; document.title = p === '/' ? 'Buzzer - the quiz show in your pocket' : `${titles[p] || 'Not found'} | Buzzer` }, [pathname])
  return null
}
