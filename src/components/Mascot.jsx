import { useId } from 'react'

// The buzzer crew: four hand-drawn creatures that react to how the game is going.
export const SKIN = { zap: '#ffd400', bloop: '#19d3ff', pip: '#ff2e93', rex: '#7dff4f' }
export const MASCOTS = [['zap', 'Zap'], ['bloop', 'Bloop'], ['pip', 'Pip'], ['rex', 'Rex']]
const D = '#12082f'
const MOTION = { idle: 'bob', happy: 'hop', sad: 'droop', panic: 'shake' }

export default function Mascot({ kind = 'zap', mood = 'idle', size = 110, className = '' }) {
  const id = useId().replace(/:/g, ''), c = SKIN[kind] || SKIN.zap
  const eye = (cx) => mood === 'happy'
    ? <path d={`M${cx - 7} 58q7-10 14 0`} fill="none" />
    : <><circle cx={cx} cy="56" r={mood === 'panic' ? 9 : 7} fill="#fff" /><circle cx={cx} cy={mood === 'sad' ? 59 : 56} r={mood === 'panic' ? 2.2 : 3.5} fill={D} stroke="none" />{mood === 'sad' && <path d={`M${cx - 8} ${cx < 50 ? 44 : 48}l16 ${cx < 50 ? 4 : -4}`} fill="none" />}</>
  const mouth = mood === 'happy' ? <path d="M42 72q14 22 28 0z" fill={D} /> : mood === 'sad' ? <path d="M44 84q12-12 24 0" fill="none" /> : mood === 'panic' ? <ellipse cx="56" cy="82" rx="6" ry="8" fill={D} /> : <path d="M46 78q10 8 20 0" fill="none" />
  const decor = { zap: <path d="M60 2l-12 18h9l-5 14 16-20h-9z" fill="#fff" />, bloop: <path d="M56 4q-12 16 0 22q12-6 0-22z" fill="#fff" />, pip: <><path d="M56 30V10" fill="none" /><circle cx="56" cy="8" r="6" fill="#fff" /></>, rex: <path d="M30 36l6-18 10 14 10-20 10 20 10-14 6 18z" fill={c} /> }[kind]
  return (
    <svg viewBox="0 0 112 120" width={size} height={size} className={`${MOTION[mood]} ${className}`} role="img" aria-label={`${kind} the buzzer mascot, feeling ${mood}`}>
      <defs><filter id={id}><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="2" /><feDisplacementMap in="SourceGraphic" scale="2.6" /></filter></defs>
      <g filter={`url(#${id})`} stroke={D} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="38" cy="108" rx="12" ry="6" fill={c} /><ellipse cx="74" cy="108" rx="12" ry="6" fill={c} />
        {decor}
        <ellipse cx="56" cy="68" rx="42" ry="38" fill={c} />
        {mood === 'happy' && <><circle cx="28" cy="74" r="6" fill="#ff2e93" stroke="none" opacity=".75" /><circle cx="84" cy="74" r="6" fill="#ff2e93" stroke="none" opacity=".75" /></>}
        {eye(40)}{eye(72)}{mouth}
        {mood === 'panic' && <path d="M96 38q-7 11 0 15q7-4 0-15z" fill="#19d3ff" />}
      </g>
    </svg>
  )
}
