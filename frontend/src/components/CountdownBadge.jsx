import { useCountdown, formatCountdown } from '../hooks/useCountdown'

export default function CountdownBadge({ initialSeconds, style = {} }) {
  const seconds = useCountdown(initialSeconds)
  const label   = formatCountdown(seconds)

  const color =
    seconds <= 0      ? '#9e9e9e' :
    seconds < 3600    ? '#c62828' :   /* menos de 1 hora: rojo */
    seconds < 86400   ? '#e65100' :   /* menos de 1 dia: naranja */
                        '#2e7d32'     /* mas de 1 dia: verde */

  const weight = seconds > 0 && seconds < 3600 ? 700 : 600

  return (
    <span style={{
      fontSize: '0.82rem',
      fontWeight: weight,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontVariantNumeric: 'tabular-nums',
      ...style,
    }}>
      {seconds > 0 ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )}
      {label}
    </span>
  )
}
