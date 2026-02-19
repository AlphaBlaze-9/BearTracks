import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import ItemCard from '../components/ItemCard.jsx'
import MotionReveal from '../components/MotionReveal.jsx'
import { useItems } from '../context/ItemsContext.jsx'

/**
 * BrowsePage
 * ----------
 * A dedicated page for browsing items.
 */

export default function BrowsePage() {
  const { items } = useItems()

  // Simple filters
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return items
      .filter((it) => (status === 'All' ? true : it.status === status))
      .filter((it) => {
        if (!query) return true
        return (
          String(it.title || '').toLowerCase().includes(query) ||
          String(it.description || '').toLowerCase().includes(query) ||
          String(it.category || '').toLowerCase().includes(query)
        )
      })
  }, [items, q, status])

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-12 sm:pt-20 pb-10">
        <Container>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <MotionReveal>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Browse <span className="text-brand-blue">items</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-700 font-medium">
                Photos make posts easier to recognize. You can browse without an account.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.1}>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                <label className="w-full sm:w-72">
                  <span className="sr-only">Search</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search (calculator, bottle, AirPods…)"
                    className="input-field shadow-sm focus:shadow-md transition-shadow h-12 text-sm font-medium"
                  />
                </label>

                <label className="w-full sm:w-40">
                  <span className="sr-only">Status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="select-field shadow-sm h-12 text-sm font-bold text-slate-700"
                  >
                    <option>All</option>
                    <option>Lost</option>
                    <option>Found</option>
                  </select>
                </label>
              </div>
            </MotionReveal>
          </div>

          <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <MotionReveal delay={0.2}>
              <div className="mt-12 rounded-[2.5rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-12 text-center shadow-soft">
                <Search className="w-16 h-16 text-brand-blue/40 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                <p className="mt-2 text-slate-600 font-medium">Try a different search or filter to find what you're looking for.</p>
              </div>
            </MotionReveal>
          )}
        </Container>
      </Section>
    </div>
  )
}
