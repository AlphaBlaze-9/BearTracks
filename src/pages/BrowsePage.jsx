// BrowsePage.jsx: Public-facing catalog page where anyone can browse all lost and found items.
// Supports real-time text search across title, description, and category fields,
// as well as a status filter to narrow results to "Lost" or "Found" posts only.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import ItemCard from "../components/ItemCard.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useItems } from "../context/ItemsContext.jsx";


export default function BrowsePage() {
  // Pull the full item list from the global ItemsContext (synced with Supabase in real time)
  const { items } = useItems();

  // Search query string — filters items by title, description, or category
  const [q, setQ] = useState("");

  // Status filter — "All" shows every item, "Lost" or "Found" narrows the results
  const [status, setStatus] = useState("All");

  // Derive the filtered list from the full item array using memoization.
  // This avoids re-running the filter on every render unless `items`, `q`, or `status` changes.
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      // First pass: apply the status dropdown filter
      .filter((it) => (status === "All" ? true : it.status === status))
      // Second pass: apply the text search across three item fields
      .filter((it) => {
        if (!query) return true; // No query means all items pass this check
        return (
          String(it.title || "")
            .toLowerCase()
            .includes(query) ||
          String(it.description || "")
            .toLowerCase()
            .includes(query) ||
          String(it.category || "")
            .toLowerCase()
            .includes(query)
        );
      });
  }, [items, q, status]);

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-12 sm:pt-20 pb-10">
        <Container>

          {/* ── Page Header & Filter Controls ── */}
          {/* Title on the left, search input and status dropdown on the right (stacked on mobile) */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <MotionReveal>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Browse <span className="text-brand-blue">items</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-700 font-medium">
                Photos make posts easier to recognize. You can browse without an
                account.
              </p>
            </MotionReveal>

            {/* Search and status filter controls — stacked on small screens, inline on sm+ */}
            <MotionReveal delay={0.1}>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                {/* Text search field — updates `q` state on every keystroke */}
                <label className="w-full sm:w-72">
                  <span className="sr-only">Search</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search (calculator, bottle, AirPods…)"
                    className="input-field shadow-sm focus:shadow-md transition-shadow h-12 text-sm font-medium"
                  />
                </label>

                {/* Status dropdown — three options: All, Lost, Found */}
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

          {/* ── Item Grid ── */}
          {/* Animated grid that re-renders smoothly whenever the filtered list changes */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Render one ItemCard per filtered result — each card links to the detail page */}
            {filtered.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </motion.div>

          {/* ── Empty State ── */}
          {/* Shown when the current search/filter combination returns no matching items */}
          {filtered.length === 0 && (
            <MotionReveal delay={0.2}>
              <div className="mt-12 rounded-[2.5rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-12 text-center shadow-soft">
                <Search
                  className="w-16 h-16 text-brand-blue/40 mx-auto mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-bold text-slate-900">
                  No matches found
                </h3>
                <p className="mt-2 text-slate-600 font-medium">
                  Try a different search or filter to find what you're looking
                  for.
                </p>
              </div>
            </MotionReveal>
          )}
        </Container>
      </Section>
    </div>
  );
}
