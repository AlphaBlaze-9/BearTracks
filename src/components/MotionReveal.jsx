import { motion } from 'framer-motion'

/**
 * MotionReveal
 * -----------
 * A thin wrapper around framer-motion to make scroll-in animations consistent.
 *
 * Why this exists:
 *  - without a wrapper, every section repeats the same motion props
 *  - this keeps the site feeling cohesive and makes future edits easier
 */
export default function MotionReveal({
  children,
  delay = 0,
  y = 14,
  ...rest
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
