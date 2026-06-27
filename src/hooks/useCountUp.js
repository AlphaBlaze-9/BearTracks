// useCountUp.js: Animates a numeric value from 0 to a target using requestAnimationFrame.
// Returns a formatted string that updates each animation frame, producing a smooth
// count-up effect. Designed to be triggered by scroll visibility (start=true when
// the stats section enters the viewport) so numbers don't count off-screen.

import { useEffect, useMemo, useState } from "react";

// Props:
//   target     — the final number to count up to
//   start      — boolean that kicks off the animation (set true when element is in view)
//   durationMs — total animation time in milliseconds (default: 1200ms)
//   decimals   — how many decimal places to display (default: 0)
export function useCountUp({ target, start, durationMs = 1200, decimals = 0 }) {
  const [value, setValue] = useState(0);

  // Round the target to the requested decimal precision once — avoids re-computing
  // this on every animation frame and eliminates floating-point drift.
  const targetRounded = useMemo(() => {
    const factor = 10 ** decimals;
    return Math.round(target * factor) / factor;
  }, [target, decimals]);

  useEffect(() => {
    // Do nothing until the parent signals the animation should start.
    // This prevents numbers counting up before the user can see them.
    if (!start) return;

    let rafId = 0;
    const startTime = performance.now();

    // Each requestAnimationFrame tick calculates how far along the animation is (0–1),
    // applies an ease-out cubic curve so the number decelerates as it approaches the
    // target, and updates the displayed value.
    const tick = (now) => {
      const elapsed = now - startTime;
      // t: normalized progress (0 = start, 1 = fully complete)
      const t = Math.min(1, elapsed / durationMs);

      // Ease-out cubic: fast acceleration, smooth deceleration near the end
      const eased = 1 - Math.pow(1 - t, 3);

      const next = targetRounded * eased;
      setValue(next);

      if (t < 1) {
        // Animation is still in progress — schedule the next frame
        rafId = requestAnimationFrame(tick);
      } else {
        // Snap to the exact target on the final frame to avoid floating-point imprecision
        setValue(targetRounded);
      }
    };

    rafId = requestAnimationFrame(tick);

    // Cancel the pending frame if the component unmounts mid-animation
    return () => cancelAnimationFrame(rafId);
  }, [start, durationMs, targetRounded]);

  // Format to the requested number of decimal places for consistent display
  const formatted = useMemo(() => {
    return value.toFixed(decimals);
  }, [value, decimals]);

  return formatted;
}
