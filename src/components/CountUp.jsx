// CountUp.jsx: Renders an animated number that counts from 0 to a target value.
// Uses requestAnimationFrame (via useEffect) and an ease-out cubic curve for a
// smooth, professional count-up animation. Respects both the OS prefers-reduced-motion
// setting and the site-level "Pause Animations" accessibility preference.

import { useEffect, useMemo, useState } from "react";

// Props:
//   value    — the final number to count up to
//   duration — animation duration in milliseconds (default: 1200)
//   decimals — decimal places to display (default: 0)
//   prefix   — string rendered before the number (e.g., "$")
//   suffix   — string rendered after the number (e.g., "%", "+")
//   start    — boolean; animation begins when this becomes true (e.g., when in view)
export default function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  start = true,
}) {
  // display: the current animated number (floats between 0 and `value` during animation)
  const [display, setDisplay] = useState(0);

  // Memoize the Intl formatter so it isn't recreated on every animation frame
  const formatter = useMemo(() => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [decimals]);

  useEffect(() => {
    // Wait for the parent to signal that the element is visible before counting
    if (!start) return;

    // ── Accessibility: Skip Animation ──────────────────────────────────────
    // Jump straight to the final value if the user prefers reduced motion at the
    // OS level OR has toggled "Pause Animations" in the BearTracks widget.
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const isAnimationsPaused = localStorage.getItem('accessAid_pauseAnimations') === 'true';
    if (prefersReduced || isAnimationsPaused) {
      setDisplay(value);
      return;
    }

    // ── RequestAnimationFrame Loop ─────────────────────────────────────────
    let rafId = null;
    const startTime = performance.now();
    const from = 0;
    const to = value;

    const tick = (now) => {
      const elapsed = now - startTime;
      // t: normalized progress between 0 (start) and 1 (complete)
      const t = Math.min(1, elapsed / duration);

      // Ease-out cubic: rapid start, decelerates smoothly as it approaches `to`
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;

      setDisplay(next);

      if (t < 1) {
        // Still animating — request the next frame
        rafId = requestAnimationFrame(tick);
      } else {
        // Snap to the exact target on the last frame to avoid floating-point drift
        setDisplay(to);
      }
    };

    rafId = requestAnimationFrame(tick);

    // Cancel any pending frame if the component unmounts mid-animation
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
