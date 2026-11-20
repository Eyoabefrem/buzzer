// A big round buzzer button with a lightning bolt.
export function Mark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="33" rx="16" ry="5" fill="#12082f" />
      <circle cx="20" cy="20" r="15" fill="#ff2e93" stroke="#12082f" strokeWidth="3" />
      <path d="M22 8l-8 13h5l-2 11 9-14h-5z" fill="#ffd400" stroke="#12082f" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
export default function Logo({ size = 36 }) {
  return <span className="inline-flex items-center gap-2"><Mark size={size} /><span className="display text-2xl" style={{ color: 'var(--y)' }}>buzzer</span></span>
}
