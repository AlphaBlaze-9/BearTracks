// Section.jsx: Semantic <section> wrapper with consistent vertical rhythm.
// All major page regions (hero, browse grid, stats, FAQ) use this component so
// that vertical spacing is uniform and easy to tweak in one place.
// Accepts a `ref` via forwardRef so parent components can observe scroll position
// with IntersectionObserver (e.g., triggering count-up animations in Stats).

import { forwardRef } from "react";

// forwardRef allows the caller to attach a ref directly to the underlying <section>
// element — useful for scroll-based animation triggers and anchor links.
const Section = forwardRef(({ id, className = "", children }, ref) => {
  return (
    // py-16 / sm:py-20 provides consistent top-and-bottom section padding
    // across mobile and desktop without requiring per-section overrides.
    <section ref={ref} id={id} className={`py-16 sm:py-20 ${className}`}>
      {children}
    </section>
  );
});

// displayName is required for React DevTools to show a meaningful label
// when components are created with forwardRef — otherwise it shows as "ForwardRef".
Section.displayName = "Section";

export default Section;
