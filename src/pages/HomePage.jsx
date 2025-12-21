import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import MotionReveal from '../components/MotionReveal.jsx'
import StatCard from '../components/StatCard.jsx'
import FAQItem from '../components/FAQItem.jsx'

/**
 * HomePage
 * --------
 * Your original landing page lives here now.
 *
 * We moved it out of App.jsx so we can add more pages:
 * - /browse (browse items)
 * - /submit (submit lost/found - login required)
 * - /login, /signup
 */

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-hero">
      {/* HERO */}
      <main>
        <Section className="pt-16 sm:pt-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <MotionReveal>
                  <p className="pill inline-flex items-center gap-2 text-xs text-slate-700">
                    <span className="inline-flex h-2 w-2 rounded-full bg-brand-gold" />
                    New: faster reporting + smarter matching
                  </p>
                </MotionReveal>

                <MotionReveal delay={0.05}>
                  <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                    Lost something at school?
                    <span className="block text-slate-700">Find it faster with Bear Tracks.</span>
                  </h1>
                </MotionReveal>

                <MotionReveal delay={0.1}>
                  <p className="mt-5 max-w-xl text-base text-slate-600 leading-relaxed">
                    A clean, student-friendly lost &amp; found experience.
                    Report items in seconds, browse verified posts, and get notified when matches show up.
                  </p>
                </MotionReveal>

                <MotionReveal delay={0.15}>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Login is required to submit — ProtectedRoute will redirect if needed */}
                    <Link
                      to="/submit"
                      className="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-medium text-white hover:bg-brand-blue-dark"
                    >
                      Report an item
                    </Link>
                    <Link
                      to="/browse"
                      className="rounded-2xl border border-brand-blue/20 bg-brand-blue/10 px-6 py-3 text-sm font-medium text-slate-900 hover:bg-brand-blue/15"
                    >
                      Browse items
                    </Link>
                  </div>
                </MotionReveal>

                <MotionReveal delay={0.2}>
                  <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="pill">No account needed to browse</span>
                    <span className="pill">Mobile-first</span>
                    <span className="pill">Accessible animations</span>
                  </div>
                </MotionReveal>
              </div>

              {/* Right side “preview” card */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="card overflow-hidden"
              >
                <div className="border-b border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Today’s highlights</div>
                      <div className="mt-1 text-xs text-slate-600">Quick view of recent activity</div>
                    </div>
                    <span className="pill text-xs text-slate-700">Live</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-3">
                    {[
                      { title: 'Water bottle (blue)', meta: 'Found • Library • 2:10 PM' },
                      { title: 'AirPods case', meta: 'Lost • Gym • Yesterday' },
                      { title: 'Calculator', meta: 'Found • Room 214 • Mon' },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
                        className="rounded-2xl border border-brand-blue/10 bg-white/65 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-medium">{item.title}</div>
                            <div className="mt-1 text-xs text-slate-600">{item.meta}</div>
                          </div>
                          <span className="text-lg">🔎</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-brand-blue p-5 text-white">
                    <div className="text-sm font-semibold">Auto-match notifications</div>
                    <p className="mt-2 text-xs text-white/80">
                      When someone reports a similar item, Bear Tracks can nudge both posts to connect.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* HOW IT WORKS */}
        <HowItWorksSection />

        {/* STATS */}
        <Section id="stats">
          <Container>
            <MotionReveal>
              <h2 className="text-2xl font-semibold tracking-tight">The numbers</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                These are example metrics — replace them with your real stats.
                The counters animate when they scroll into view.
              </p>
            </MotionReveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Items returned" value={1287} suffix="+" />
              <StatCard label="Avg. time to match" value={3.2} decimals={1} suffix=" days" />
              <StatCard label="Reports this week" value={94} />
              <StatCard label="Matches suggested" value={312} />
            </div>
          </Container>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="bg-brand-gold/10">
          <Container>
            <MotionReveal>
              <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                Quick answers. If you want, I can also convert this into an accordion page.
              </p>
            </MotionReveal>

            <div className="mt-8 grid gap-3">
              <FAQItem q="Do I need an account to browse items?">
                Nope — browsing is open. You only need an account to submit a lost/found post.
              </FAQItem>
              <FAQItem q="Can I add a photo?">
                Yes. The submit form supports photos and shows a preview before you post.
              </FAQItem>
              <FAQItem q="Is this connected to a real backend?">
                Not yet. This build stores everything in localStorage so you can prototype fast.
              </FAQItem>
            </div>
          </Container>
        </Section>

        {/* CONTACT / CTA */}
        <Section id="contact">
          <Container>
            <MotionReveal className="card p-8">
              <h2 className="text-2xl font-semibold tracking-tight">Want this set up for your school?</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                Replace this section with your real form / email / contact flow.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/browse"
                  className="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-medium text-white hover:bg-brand-blue-dark"
                >
                  Browse items
                </Link>
                <Link
                  to="/submit"
                  className="rounded-2xl border border-brand-blue/20 bg-brand-blue/10 px-6 py-3 text-sm font-medium text-slate-900 hover:bg-brand-blue/15"
                >
                  Report an item
                </Link>
              </div>
            </MotionReveal>
          </Container>
        </Section>

        <footer className="py-10">
          <Container>
            <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
              <div>© {new Date().getFullYear()} Bear Tracks</div>
              <div className="flex gap-4">
                <a className="hover:text-slate-700" href="#top">
                  Back to top
                </a>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  )
}

function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const steps = [
    {
      title: 'Report',
      body: 'Post a lost or found item with a description and location. Our smart form makes it quick.',
      icon: '✍️',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Verify',
      body: 'Moderators or office staff quickly confirm the post to ensure accuracy and safety.',
      icon: '✅',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Match',
      body: 'Our system automatically surfaces similar posts together, reducing the manual guesswork.',
      icon: '🧩',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Return',
      body: 'Arrange a safe pickup through the platform and close the loop with a simple confirmation.',
      icon: '🎒',
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <Section id="how" className="overflow-hidden">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <MotionReveal>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Four simple steps to get items back where they belong. Click a step to see how it works.
              </p>
            </MotionReveal>

            <div className="mt-10 space-y-4">
              {steps.map((step, idx) => (
                <button
                  key={step.title}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left transition-all duration-300 ${activeIndex === idx
                    ? 'scale-[1.02] ring-1 ring-slate-200 shadow-md'
                    : 'opacity-60 hover:opacity-100'
                    }`}
                >
                  <div className={`p-4 rounded-3xl border ${activeIndex === idx ? 'bg-white border-transparent' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${step.color}`}>
                        {step.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{step.title}</div>
                        {activeIndex === idx && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-1 text-sm text-slate-600 leading-relaxed"
                          >
                            {step.body}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative aspect-square lg:aspect-auto lg:h-[500px]">
            <div className="absolute inset-0 bg-brand-gold/5 rounded-[40px] -rotate-2" />
            <div className="absolute inset-0 bg-brand-blue/5 rounded-[40px] rotate-2" />
            <div className="relative h-full w-full glass rounded-[40px] flex items-center justify-center p-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.4, ease: 'backOut' }}
                  className="text-center"
                >
                  <div className={`mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-[2.5rem] text-6xl shadow-xl ${steps[activeIndex].color}`}>
                    {steps[activeIndex].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{steps[activeIndex].title}</h3>
                  <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-sm mx-auto">
                    {steps[activeIndex].body}
                  </p>

                  {/* Decorative element */}
                  <div className="mt-8 flex justify-center gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-8 bg-brand-blue' : 'w-2 bg-slate-200'
                          }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
