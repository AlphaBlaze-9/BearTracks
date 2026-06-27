// MotionReveal.jsx: Reusable scroll-reveal animation wrapper for BearTracks.
// Wraps any content in a Framer Motion div that fades in and slides up
// when it enters the viewport. Using a shared wrapper keeps scroll animations
// consistent across every section without repeating motion props.

import { motion } from "framer-motion";

// Props:
//   children  — the content to animate
//   delay     — optional stagger offset in seconds (default: 0)
//   y         — how far below the final position the element starts (default: 14px)
//   ...rest   — any additional props are spread onto the motion.div (e.g., className)
export default function MotionReveal({ children, delay = 0, y = 14, ...rest }) {
  return (
    <motion.div
      // Start invisible and slightly below the natural position
      initial={{ opacity: 0, y }}
      // Animate to full opacity and resting position when scrolled into view
      whileInView={{ opacity: 1, y: 0 }}
      // `once: true` means the animation only plays on first appearance, not on re-scroll
      // `amount: 0.25` triggers when 25% of the element is visible — avoids premature fire
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
