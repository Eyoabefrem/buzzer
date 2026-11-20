import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function NotFound() {
  return <div><Header /><main className="max-w-3xl mx-auto px-5 py-16 text-center"><p className="display text-[clamp(6rem,28vw,14rem)]" style={{ color: 'var(--p)', textShadow: '0 8px 0 var(--dk)' }}>404</p><h1 className="display text-3xl">Wrong buzzer</h1><p className="mt-3 text-lg" style={{ color: 'var(--muted)' }}>This page isn’t on the show.</p><Link to="/" className="btn mt-8">Back to the stage</Link></main></div>
}
