import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInViewOnce } from "../hooks/useInViewOnce";
import { useCountUp } from "../hooks/useCountUp";

/**
 * Stats
 * -----
 * This section demonstrates the "counting" animation you requested.
 * Each number animates ONLY once, when the section scrolls into view.
 */
export default function Stats() {
  const prefersReducedMotion = useReducedMotion();
  const [ref, inView] = useInViewOnce({ threshold: 0.25 });

  const stats = [
    { label: "Items returned", value: 1248, suffix: "+" },
    { label: "Avg. match time", value: 3.2, suffix: " hrs", decimals: 1 },
    { label: "Active students", value: 760, suffix: "+" },
    { label: "Campus drop spots", value: 18, suffix: "" },
  ];

  return (
    <section id="stats" className="relative" ref={ref}>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, idx) => (
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

function StatCard({ stat, start, idx, reduceMotion }) {
  const counted = useCountUp({
    target: stat.value,
    start,
    durationMs: 900 + idx * 120,
    decimals: stat.decimals ?? 0,
  });

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      className="glass rounded-3xl p-6 shadow-soft"
    >
      <div className="text-3xl font-semibold tracking-tight">
        {reduceMotion ? stat.value : counted}
        <span className="text-white/70">{stat.suffix}</span>
      </div>
      <div className="mt-2 text-sm text-white/70">{stat.label}</div>
    </motion.div>
  );
}
