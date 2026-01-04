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
    <div ref={ref} className="card p-6 border-brand-orange/30 bg-brand-orange/10 backdrop-blur-md shadow-xl transition-all hover:scale-[1.05]">
      <div className="text-4xl font-black tracking-tighter text-[#5d3000]">
        <CountUp value={value} start={isInView} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <div className="mt-2 text-sm text-[#7c4100] font-black uppercase tracking-widest">{label}</div>
    </div>
  )
}
