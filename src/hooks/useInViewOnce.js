import { useEffect, useRef, useState } from 'react'

/**
 * useInViewOnce
 * ------------
 * Tiny helper around IntersectionObserver.
 * Returns [ref, isInView]. Once it becomes visible, it stays true.
 */
export function useInViewOnce(options = { threshold: 0.2 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current || inView) return

    const obs = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        setInView(true)
        obs.disconnect()
      }
    }, options)

    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [inView, options])

  return [ref, inView]
}
