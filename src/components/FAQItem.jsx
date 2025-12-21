import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * FAQItem
 * -------
 * Expand/collapse row with a small animation.
 *
 * Tip: For accessibility, we use a <button> so it works with keyboards.
 */
export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card p-5">
      <button
        className="w-full text-left flex items-center justify-between gap-4"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-slate-900">{question}</span>
        <span className="text-slate-500">{open ? '−' : '+'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
