import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import ItemCard from '../components/ItemCard.jsx'
import { useItems } from '../context/ItemsContext.jsx'

/**
 * BrowsePage
 * ----------
 * A dedicated page for browsing items.
 *
 * Per your request:
 * - this page has the "photo-first" card layout
 * - cards do NOT show location/date (only title, description, category, status)
 */

export default function BrowsePage() {
  const { items } = useItems()

  // Simple filters — not "too complex" but helps when the list grows.
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
      <Section className="pt-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Browse items</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Photos make posts easier to recognize. You can browse without an account.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label className="w-full sm:w-72">
                <span className="sr-only">Search</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search (calculator, bottle, AirPods…)"
                  className="input-field focus:outline-none"
                />
              </label>

              <label className="w-full sm:w-40">
                <span className="sr-only">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="select-field"
                >
                  <option>All</option>
                  <option>Lost</option>
                  <option>Found</option>
                </select>
              </label>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-10 rounded-2xl border border-brand-blue/10 bg-white/60 p-6 text-sm text-slate-600">
              No matches. Try a different search.
            </div>
          )}
        </Container>
      </Section>
    </div>
  )
}
