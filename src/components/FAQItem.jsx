import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FAQItem
 * -------
 * Expand/collapse row with a small animation.
 *
 * Tip: For accessibility, we use a <button> so it works with keyboards.
 */
export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card p-5 border-brand-blue/30 bg-brand-blue/10 backdrop-blur-md transition-all hover:bg-brand-blue/20">
      <button
        className="w-full text-left flex items-center justify-between gap-4 group"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <span className="text-sm font-black text-[#062d78] group-hover:text-brand-blue transition-colors">
          {question}
        </span>
        <span className="text-[#083796] font-black">{open ? "−" : "+"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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
