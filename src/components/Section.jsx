/**
 * Section
 * -------
 * Provides consistent vertical spacing between major sections.
 * (You can tweak these padding values to re-scale the whole page.)
 */
export default function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      {children}
    </section>
  )
}
