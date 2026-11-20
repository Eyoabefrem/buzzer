import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/auth'
import { ProfileProvider } from './lib/profile'
import Titles from './components/Titles'
import Landing from './pages/Landing'
import Play from './pages/Play'
import Game from './pages/Game'
import Results from './pages/Results'
import Stats from './pages/Stats'
import Party from './pages/Party'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ProfileProvider>
      <BrowserRouter>
        <Titles />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/play" element={<Play />} />
          <Route path="/game" element={<Game />} />
          <Route path="/results" element={<Results />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/party" element={<Party />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  </AuthProvider>
)

// Lets Buzzer open offline and be installed as an app.
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
