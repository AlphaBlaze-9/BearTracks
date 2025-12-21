import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * CTA
 * ---
 * A fake "report" form to show layout/spacing.
 * Replace the onSubmit handler with your real logic (Firebase, backend, etc.).
 */
export default function CTA() {
  const reduce = useReducedMotion()
  const [status, setStatus] = useState('idle')

  function onSubmit(e) {
    e.preventDefault()
    setStatus('sent')
    // In a real app, you'd POST to your backend here.
  }

  return (
    <section id="cta" className="relative">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-blue/25 via-white/5 to-brand-orange/20 p-1">
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to make lost & found painless?</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                  This is a starter layout. Plug in your real routes/components, and keep the animation + spacing patterns.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/75">
                  <li className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Clear hierarchy (headlines → cards → details)</li>
                  <li className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Motion that supports scanning</li>
                  <li className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Count-up stats animation</li>
                </ul>
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Item" placeholder="e.g., Water bottle" />
                  <Field label="Category" placeholder="e.g., Clothing / Tech" />
                </div>
                <Field label="Where was it lost/found?" placeholder="e.g., Gym entrance" />
                <Field label="Details" placeholder="Any unique marks, stickers, etc." />

                <motion.button
                  type="submit"
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.99 }}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-soft"
                >
                  {status === 'sent' ? 'Submitted ✓' : 'Submit report'}
                </motion.button>

                <p className="text-xs text-white/60">
                  (Demo form) — no data is actually sent.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({ label, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      <input
        className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none ring-1 ring-white/10 focus:ring-white/25"
        placeholder={placeholder}
      />
    </label>
  )
}
