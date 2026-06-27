// useInViewOnce.js: IntersectionObserver hook that fires once and stays true.
// Similar to useInView but returns a tuple [ref, inView] instead of an object,
// which matches the React useState destructuring convention used by Stats.jsx.
// The observer disconnects immediately after the first intersection so the state
// never reverts back to false on subsequent scroll events.

import { useEffect, useRef, useState } from "react";

// Options:
//   threshold — fraction of the element visible before triggering (default: 20%)
//
// Returns: [ref, inView]
//   ref    — attach to the target DOM element
//   inView — boolean, true once the element is first seen; never resets to false
export function useInViewOnce(options = { threshold: 0.2 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Skip setup if the element isn't mounted yet, or if we've already triggered —
    // re-running the effect after inView is true would reconnect a needless observer.
    if (!ref.current || inView) return;

    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        // Set inView to true and tear down the observer — we're done observing.
        setInView(true);
        obs.disconnect();
      }
    }, options);

    obs.observe(ref.current);

    // Disconnect the observer if the component unmounts before it fires
    return () => obs.disconnect();
  }, [inView, options]); // Re-runs only if options change (rare) or inView flips

  return [ref, inView];
}
