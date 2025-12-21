import CountUp from './CountUp.jsx'
import { useInView } from '../hooks/useInView.js'

/**
 * StatCard
 * --------
 * A single stat tile.
 *
 * Important detail:
 *  - The number animates ONLY when the tile scrolls into view.
 *    This avoids “counting in the background” before the user sees it.
 */
export default function StatCard({ label, value, suffix = '', prefix = '', decimals = 0 }) {
  const { ref, isInView } = useInView({ threshold: 0.3 })

  return (
    <div ref={ref} className="card p-6">
      <div className="text-3xl font-semibold tracking-tight">
        <CountUp value={value} start={isInView} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <div className="mt-2 text-sm text-slate-600">{label}</div>
    </div>
  )
}
