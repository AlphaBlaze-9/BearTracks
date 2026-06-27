// StatCard.jsx: Renders a single animated statistic tile for the BearTracks homepage.
// The number animates from 0 to its target value using the CountUp component, but
// only once the tile scrolls into the viewport — preventing the count from running
// off-screen where the user cannot see it. Used inside the Stats section of HomePage.

import CountUp from "./CountUp.jsx";
import { useInView } from "../hooks/useInView.js";

// Props:
//   label    — descriptive text beneath the number (e.g., "Items Returned")
//   value    — the numeric target (e.g., 1200)
//   suffix   — optional string appended after the number (e.g., "+")
//   prefix   — optional string prepended before the number (e.g., "$")
//   decimals — decimal places to display (default: 0)
export default function StatCard({
  label,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
}) {
  // useInView fires once when this tile enters the viewport at 30% visibility.
  // isInView is passed to CountUp as the `start` flag to begin the animation.
  const { ref, isInView } = useInView({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      // role="region" + aria-label gives screen readers a meaningful description
      // of the stat without requiring them to parse the number and label separately.
      role="region"
      aria-label={`${label}: ${prefix}${value}${suffix}`}
      className="card p-6 border-brand-orange/30 bg-brand-orange/10 backdrop-blur-md shadow-xl transition-all hover:scale-[1.05]"
    >
      {/* ── Animated Number ─────────────────────────────────────────────── */}
      {/* CountUp receives `start={isInView}` so the animation begins only when visible */}
      <div className="text-4xl font-black tracking-tighter text-[#5d3000]">
        <CountUp
          value={value}
          start={isInView}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </div>

      {/* ── Label ───────────────────────────────────────────────────────── */}
      <div className="mt-2 text-sm text-[#7c4100] font-black uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}
