import { useEffect, useState } from 'react'

export function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds ?? 0)

  useEffect(() => {
    const s = initialSeconds ?? 0
    setSeconds(s)
    if (s <= 0) return
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [initialSeconds])

  return seconds
}

export function formatCountdown(seconds) {
  if (seconds <= 0) return 'Cerrada'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${pad(s)}s`
}

function pad(n) { return String(n).padStart(2, '0') }
