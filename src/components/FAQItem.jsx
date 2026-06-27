// FAQItem.jsx: Accessible, animated accordion row for the BearTracks FAQ section.
// Each question collapses its answer by default; clicking the button toggles it open.
// Framer Motion animates the height so content expands and contracts smoothly rather
// than snapping. The animation duration is zeroed out if the user has paused animations.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Props:
//   question — the question text rendered in the button label
//   answer   — the answer text revealed when the accordion is expanded
// Tip: Using a <button> (not a <div>) makes the toggle keyboard-accessible
//      and ensures screen readers announce it as an interactive control.
export default function FAQItem({ question, answer }) {
  // open: tracks whether this accordion item is expanded
  const [open, setOpen] = useState(false);

  return (
    <div className="card p-5 border-brand-blue/30 bg-brand-blue/10 backdrop-blur-md transition-all hover:bg-brand-blue/20">

      {/* ── Toggle Button ──────────────────────────────────────────────── */}
      {/* aria-expanded communicates the current state to screen readers */}
      <button
        className="w-full text-left flex items-center justify-between gap-4 group"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-label={`${question} (${open ? "Expanded" : "Collapsed"})`}
      >
        <span className="text-sm font-black text-[#062d78] group-hover:text-brand-blue transition-colors">
          {question}
        </span>
        {/* + / − indicator gives a visual cue of the toggle state */}
        <span className="text-[#083796] font-black">{open ? "−" : "+"}</span>
      </button>

      {/* ── Animated Answer Panel ──────────────────────────────────────── */}
      {/* AnimatePresence with initial={false} prevents the animation from
          running on the very first render (page load). */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            // If the user has paused animations, skip the expand/collapse transition entirely
            initial={localStorage.getItem('accessAid_pauseAnimations') === 'true' ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={localStorage.getItem('accessAid_pauseAnimations') === 'true' ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: localStorage.getItem('accessAid_pauseAnimations') === 'true' ? 0 : 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm text-[#083796] font-bold leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
