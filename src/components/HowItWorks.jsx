import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * HowItWorks
 * ----------
 * A simple timeline-style layout.
 * The point is readability: aligned columns, consistent gaps.
 */
export default function HowItWorks() {
  const reduce = useReducedMotion()
  const steps = [
    {
      title: 'Post',
      body: 'Take a quick photo, choose a category, and drop a short description.',
      icon: '📝',
    },
    {
      title: 'Match',
      body: 'Students browse and filter. Clear location tags make it easy to narrow down.',
      icon: '🔎',
    },
    {
      title: 'Verify',
      body: 'The claimant answers a simple verification prompt to confirm ownership.',
      icon: '🧾',
    },
    {
      title: 'Pick up',
      body: 'Pickup instructions are shown clearly (office hours, contact, drop spot).',
      icon: '🤝',
    },
  ]

  return (
    <section id="how" className="relative">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          A clean 4-step flow. You can map this to your actual screens later.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: 0.03 * i }}
              className="glass rounded-3xl p-6 shadow-soft"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                  {s.icon}
                </div>
                <div>
                  <div className="text-base font-semibold">{s.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-white/70">{s.body}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
