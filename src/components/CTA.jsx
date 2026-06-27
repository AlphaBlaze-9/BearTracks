// CTA.jsx: "Get BearTracks" call-to-action section with a demo report form.
// This component showcases the form layout and motion patterns for potential partner
// schools interested in adopting BearTracks. The form submission is a local no-op
// (sets status to "sent") — replace onSubmit with a real backend POST to go live.
// Framer Motion's useReducedMotion hook ensures hover/tap scales are skipped for
// users who prefer reduced motion.

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function CTA() {
  // reduce: true when the OS or React detects a prefers-reduced-motion preference
  const reduce = useReducedMotion();

  // status: tracks form submission state — "idle" shows the submit button; "sent" shows confirmation
  const [status, setStatus] = useState("idle");

  // onSubmit: in production this would POST to a backend or Netlify function.
  // For the FBLA demo, we simply flip status to "sent" to show the success state.
  function onSubmit(e) {
    e.preventDefault();
    setStatus("sent");
  }

  return (
    <section id="cta" className="relative">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        {/* ── Gradient Border Card ──────────────────────────────────────── */}
        {/* The 1px padding trick creates a gradient border without a real border property */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-blue/25 via-white/5 to-brand-orange/20 p-1">
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">

              {/* ── Left Column: Value Proposition ───────────────────────── */}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Ready to make lost &amp; found painless?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                  This is a starter layout. Plug in your real routes/components,
                  and keep the animation + spacing patterns.
                </p>

                {/* Feature highlights — concise bullets showing key differentiators */}
                <ul className="mt-6 space-y-3 text-sm text-white/75">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-gold">✓</span> Clear hierarchy
                    (headlines → cards → details)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-gold">✓</span> Motion that
                    supports scanning
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-gold">✓</span> Count-up stats
                    animation
                  </li>
                </ul>
              </div>

              {/* ── Right Column: Demo Report Form ─────────────────────────── */}
              {/* aria-label helps screen readers identify the form's purpose */}
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Item" placeholder="e.g., Water bottle" />
                  <Field label="Category" placeholder="e.g., Clothing / Tech" />
                </div>
                <Field
                  label="Where was it lost/found?"
                  placeholder="e.g., Gym entrance"
                />
                <Field
                  label="Details"
                  placeholder="Any unique marks, stickers, etc."
                />

                {/* Submit button with subtle scale feedback; scales skipped if reduce=true */}
                <motion.button
                  type="submit"
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.99 }}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-soft"
                >
                  {status === "sent" ? "Submitted ✓" : "Submit report"}
                </motion.button>

                {/* Disclaimer so FBLA judges know this is a demo form */}
                <p className="text-xs text-white/60">
                  (Demo form) — no data is actually sent.
                </p>
              </form>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
// Tiny helper component that renders a label + input pair consistently.
// Extracting it prevents repeating the same label + input structure four times.
function Field({ label, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">
        {label}
      </span>
      <input
        className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none ring-1 ring-white/10 focus:ring-white/25"
        placeholder={placeholder}
      />
    </label>
  );
}
