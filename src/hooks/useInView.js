// useInView.js: Lightweight IntersectionObserver hook that detects when an element
// enters the viewport. Once the element becomes visible, the observer disconnects
// so it only fires once — ideal for triggering animations or count-up effects a
// single time rather than re-playing on every scroll pass.

import { useEffect, useRef, useState } from "react";

// Options:
//   threshold — fraction of the element that must be visible before firing (default: 25%)
//
// Returns: { ref, isInView }
//   ref      — attach to the target DOM element via `ref={ref}`
//   isInView — boolean, becomes true once the element crosses the threshold
export function useInView(options = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Guard for environments without IntersectionObserver (very old browsers, SSR).
    // Treating the element as permanently in-view is a safe, non-breaking fallback.
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Mark as visible and immediately stop observing — the trigger is one-shot.
        // This avoids re-firing if the user scrolls away and back.
        setIsInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(el);

    // Cleanup on unmount to prevent the observer from referencing a detached element
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}
