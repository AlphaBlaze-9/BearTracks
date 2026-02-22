import { useEffect, useMemo, useState } from "react";

/**
 * CountUp
 * -------
 * Animates from 0 -> target number and then stops.
 *
 * Why not CSS?
 *  - numbers need to increment with proper rounding
 *  - we want to start counting when the user sees the stat
 *
 * Usage:
 *  <CountUp value={1200} duration={1200} />
 *
 * Props:
 *  - value: number (target)
 *  - duration: number (ms) how long the animation runs
 *  - decimals: number, number of decimal places (default: 0)
 *  - suffix / prefix: strings you want around the number
 *  - start: boolean, when true the animation begins
 */
export default function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  start = true,
}) {
  const [display, setDisplay] = useState(0);

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [decimals]);

  useEffect(() => {
    if (!start) return;

    // Respect reduced-motion: jump straight to the final value.
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    let rafId = null;
    const startTime = performance.now();
    const from = 0;
    const to = value;

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Ease-out so it feels “snappy” at the end.
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;

      setDisplay(next);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [start, duration, value]);

  return (
    <span>
      {prefix}
      {formatter.format(display)}
      {suffix}
    </span>
  );
}
