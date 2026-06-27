// Stats.jsx: Animated statistics section displayed on the BearTracks homepage.
// Each stat counts up from 0 to its target once the section scrolls into view,
// using the useInViewOnce hook to guarantee the animation fires only on first reveal.
// Individual card animations are staggered by idx * 120ms for a cascading entrance.
// All animations are bypassed when Framer Motion detects prefers-reduced-motion.

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInViewOnce } from "../hooks/useInViewOnce";
import { useCountUp } from "../hooks/useCountUp";

// Each number animates ONLY once — on first scroll into view — so it doesn't
// re-play if the user scrolls away and back.
export default function Stats() {
  // prefersReducedMotion: true when the OS reports prefers-reduced-motion: reduce.
  // Used to skip Framer Motion animations for accessibility compliance.
  const prefersReducedMotion = useReducedMotion();

  // inView: becomes true once 25% of this section is visible; never resets.
  // ref: attach to the <section> element so IntersectionObserver watches it.
  const [ref, inView] = useInViewOnce({ threshold: 0.25 });

  // Stats data — update these figures to reflect BearTracks's real impact metrics
  const stats = [
    { label: "Items returned", value: 1248, suffix: "+" },
    { label: "Avg. match time", value: 3.2, suffix: " hrs", decimals: 1 },
    { label: "Active students", value: 760, suffix: "+" },
    { label: "Campus drop spots", value: 18, suffix: "" },
  ];

  return (
    <section id="stats" className="relative" ref={ref}>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        {/* ── Section Header ─────────────────────────────────────────── */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col gap-3"
        >
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Numbers that feel real
          </h2>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            These are placeholders — swap them with your real metrics. The
            animation counts up and stops right on the target.
          </p>
        </motion.div>

        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        {/* Four-column on lg, two-column on sm, single-column on mobile */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, idx) => (
            // Each card entrance is staggered by 120ms per index for a cascade effect
            <StatCard
              key={s.label}
              stat={s}
              start={inView}
              idx={idx}
              reduceMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
// Internal card component — keeps the parent Stats component clean by isolating
// the per-card count-up logic and entrance animation.
// Props:
//   stat        — { label, value, suffix, decimals? }
//   start       — passed to useCountUp to begin the animation
//   idx         — card index, used to stagger animation delay
//   reduceMotion — skips entrance animation when true
function StatCard({ stat, start, idx, reduceMotion }) {
  // useCountUp handles the requestAnimationFrame loop and ease-out curve.
  // Duration is staggered: card 0 = 900ms, card 1 = 1020ms, etc.
  const counted = useCountUp({
    target: stat.value,
    start,
    durationMs: 900 + idx * 120,
    decimals: stat.decimals ?? 0,
  });

  return (
    <motion.div
      // Fade + slide up on first view; skipped entirely if reduceMotion is true
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      className="glass rounded-3xl p-6 shadow-soft"
    >
      {/* Animated count value — shows the final value instantly if motion is reduced */}
      <div className="text-3xl font-semibold tracking-tight">
        {reduceMotion ? stat.value : counted}
        <span className="text-white/70">{stat.suffix}</span>
      </div>
      <div className="mt-2 text-sm text-white/70">{stat.label}</div>
    </motion.div>
  );
}
