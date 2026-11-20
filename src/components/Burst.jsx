import { motion } from 'framer-motion'

// A pop of confetti from the center of its parent.
export default function Burst({ n = 24 }) {
  const colors = ['#ff2e93', '#ffd400', '#19d3ff', '#7dff4f']
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2, d = 120 + (i % 3) * 50
        return <motion.span key={i} className="absolute size-3 rounded-sm" style={{ background: colors[i % 4] }} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 0.4, rotate: 360 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      })}
    </span>
  )
}
