import { useCountdown, formatCountdown } from '../hooks/useCountdown'

export default function CountdownBadge({ initialSeconds, style = {} }) {
  const seconds = useCountdown(initialSeconds)
  const label   = formatCountdown(seconds)

  const color =
    seconds <= 0     ? '#6b7280' :
    seconds < 60     ? '#dc2626' :
    seconds < 3600   ? '#ea580c' :
                       '#16a34a'

  return (
    <span style={{
      fontSize: '0.82rem',
      fontWeight: 600,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      ...style,
    }}>
      {seconds > 0 ? '⏱' : '🔒'} {label}
    </span>
  )
}
