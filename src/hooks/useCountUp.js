import { useEffect, useMemo, useState } from 'react'

/**
 * useCountUp
 * ----------
 * Smoothly animates a number from 0 -> target, then stops.
 *
 * Notes:
 * - We only run this when `start` becomes true (e.g., when the stats section is in view).
 * - Uses requestAnimationFrame for silky motion.
 */
export function useCountUp({ target, start, durationMs = 1200, decimals = 0 }) {
  const [value, setValue] = useState(0)

  // Memoize the rounded target so we don’t recalc every render.
  const targetRounded = useMemo(() => {
    const factor = 10 ** decimals
    return Math.round(target * factor) / factor
  }, [target, decimals])

  useEffect(() => {
    if (!start) return

    let rafId = 0
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / durationMs)

      // Ease-out cubic: fast at first, slows as it approaches the target.
      const eased = 1 - Math.pow(1 - t, 3)

      const next = targetRounded * eased
      setValue(next)

      if (t < 1) rafId = requestAnimationFrame(tick)
      else setValue(targetRounded) // ensure we land exactly
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [start, durationMs, targetRounded])

  // Format the displayed number with the requested decimals.
  const formatted = useMemo(() => {
    return value.toFixed(decimals)
  }, [value, decimals])

  return formatted
}
