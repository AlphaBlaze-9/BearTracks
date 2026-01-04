import BearTracksLogo from '../BearTracksLogo.png'

/**
 * Hero
 * ----
 * Big top section with a gradient background and simple "floaty" shapes.
 */
export default function Hero() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden">
      {/* Background: gradient + subtle noise-like overlay via opacity */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/30 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(251,144,78,0.40),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.15),transparent_45%)]" />

      {/* Decorative floating blobs (purely visual) */}
      <div className="pointer-events-none absolute -top-24 left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl animate-floaty" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-brand-orange/20 blur-2xl animate-floaty" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <img
                src={BearTracksLogo}
                alt="Bear Tracks Logo"
                className="h-24 w-auto object-contain drop-shadow-2xl"
              />
            </motion.div>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/85"
            >
              <span className="h-2 w-2 rounded-full bg-brand-gold" />
              Faster claims. Fewer headaches.
            </motion.p>

            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl"
            >
              Find your stuff —
              <span className="block text-white/80">or help someone else get it back.</span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.10 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
            >
              Bear Tracks is a clean, friendly lost-and-found experience for schools.
              Post items, browse matches, and verify claims — all in minutes.
            </motion.p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.a
                href="#cta"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-soft"
              >
                Report a lost item
              </motion.a>
              <a
                href="#features"
                className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/15"
              >
                See features
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-white/65">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">🔒</span>
                Verified claims
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">⚡</span>
                Quick posting
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">📍</span>
                Clear pickup info
              </div>
            </div>
          </div>

          {/* Right side "mock" card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="glass rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Latest finds</div>
                <div className="text-xs text-white/65">Updated in real-time</div>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2 text-xs text-white/75">Today</div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { icon: '🎧', title: 'Wireless earbuds', meta: 'Found near cafeteria • 10:12 AM' },
                { icon: '🧥', title: 'Blue hoodie', meta: 'Found in gym • 11:40 AM' },
                { icon: '🔑', title: 'Key ring', meta: 'Found by main office • 1:05 PM' },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                  transition={{ delay: 0.20 + idx * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{item.title}</div>
                    <div className="truncate text-xs text-white/65">{item.meta}</div>
                  </div>
                  <div className="ml-auto text-xs text-brand-gold">Open</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-brand-gold/20 to-brand-orange/20 p-4">
              <div className="text-sm font-semibold">Pro tip</div>
              <div className="mt-1 text-xs text-white/70">
                Add a photo and exact location — it speeds up matching.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
