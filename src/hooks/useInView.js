import { useEffect, useRef, useState } from "react";

/**
 * useInView
 * ---------
 * A small hook that tells you when an element scrolls into view.
 * We use this to:
 *   - trigger animations only when the user reaches a section
 *   - start the count-up numbers when the stats section appears
 */
export function useInView(options = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser doesn’t support IntersectionObserver, just treat it as in-view.
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Once visible, we stop observing — this is a one-time trigger.
        observer.disconnect();
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}
