// CountUp.jsx: Animates from 0 -> target number and then stops.
import { useEffect, useMemo, useState } from "react";

// Why not CSS?
export default function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  start = true,
}) {
  // numbers need to increment with proper rounding
  const [display, setDisplay] = useState(0);

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [decimals]);

  // we want to start counting when the user sees the stat
  useEffect(() => {
    if (!start) return;

    // Respect reduced-motion or local storage preference: jump straight to the final value.
    // Usage: <CountUp value={1200} duration={1200} />
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    // Prop: value: number (target)
    const isAnimationsPaused = localStorage.getItem('accessAid_pauseAnimations') === 'true';
    if (prefersReduced || isAnimationsPaused) {
      setDisplay(value);
      return;
    }

    // Prop: duration: number (ms) how long the animation runs
    let rafId = null;
    const startTime = performance.now();
    // Prop: decimals: number, number of decimal places (default: 0)
    const from = 0;
    // Prop: suffix / prefix: strings you want around the number
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

    // Prop: start: boolean, when true the animation begins
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
