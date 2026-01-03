import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import MotionReveal from '../components/MotionReveal.jsx'
import StatCard from '../components/StatCard.jsx'
import FAQItem from '../components/FAQItem.jsx'
import BackToTop from '../components/BackToTop.jsx'
import ContactForm from '../components/ContactForm.jsx'
import { useItems } from '../context/ItemsContext.jsx'
import heroVideo from '../FBLA Digital Video Production.mov'


/**
 * HomePage
 * --------
 * Your original landing page lives here now.
 */

export default function HomePage() {
  const { items } = useItems()
  const navigate = useNavigate()

  // Parallax setup for the hero video
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // As we scroll through the hero (0 to 1), move the video down (0% to 30%)
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  // Scale it slightly so we don't see white space at the bottom as it moves down
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  // Get 3 most recent items
  const highlights = (items || []).slice(0, 3)

  return (
    <div id="top" className="min-h-screen bg-hero">
      <BackToTop />
      {/* HERO */}
      <main>
        <Section ref={heroRef} className="relative pt-16 sm:pt-20 overflow-hidden min-h-[600px] flex items-center">
          {/* Video Background with Parallax */}
          <motion.div
            style={{ y, scale }}
            className="absolute inset-0 z-0"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
              onTimeUpdate={(e) => {
                // Only play the first 10 seconds as requested
                if (e.target.currentTime > 10) {
                  e.target.currentTime = 0;
                }
              }}
            >
              <source src={heroVideo} type="video/quicktime" />
              <source src={heroVideo} type="video/mp4" />
            </video>
            {/* Premium Overlay: Minimal tint for better video clarity */}
            <div className="absolute inset-0 bg-brand-blue/[0.02]" />
          </motion.div>

          <Container className="relative z-10">

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="glass-light p-8 rounded-[40px] shadow-2xl border border-white/30 backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/50 to-white/20 max-w-2xl">
                <MotionReveal>
                  <p className="pill inline-flex items-center gap-2 text-xs text-slate-900 font-bold bg-white/60 backdrop-blur-sm border border-white/40">
                    <span className="inline-flex h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
                    New: faster reporting + smarter matching
                  </p>
                </MotionReveal>

                <MotionReveal delay={0.05}>
                  <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 leading-[1.1]">
                    Lost something <br />
                    <span className="text-brand-blue">at school?</span>
                    <span className="block text-slate-800 text-3xl sm:text-4xl mt-2 font-semibold">Find it faster with Bear Tracks.</span>
                  </h1>
                </MotionReveal>

                <MotionReveal delay={0.1}>
                  <p className="mt-6 max-w-xl text-lg text-slate-800 leading-relaxed font-semibold">
                    A clean, student-friendly lost &amp; found experience.
                    Report items in seconds, browse verified posts, and get notified when matches show up.
                  </p>
                </MotionReveal>

                <MotionReveal delay={0.15}>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link
                      to="/submit"
                      className="rounded-2xl bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                      Report an item
                    </Link>
                    <Link
                      to="/browse"
                      className="rounded-2xl border-2 border-brand-blue/10 bg-white/80 backdrop-blur px-8 py-4 text-sm font-bold text-slate-900 hover:bg-white/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                      Browse items
                    </Link>
                  </div>
                </MotionReveal>

                <MotionReveal delay={0.2}>
                  <div className="mt-10 flex flex-wrap gap-3 text-xs font-bold text-slate-700 uppercase tracking-widest">
                    <span className="pill bg-white/40 backdrop-blur-sm">Public Browsing</span>
                    <span className="pill bg-white/40 backdrop-blur-sm">Mobile Optimized</span>
                    <span className="pill bg-white/40 backdrop-blur-sm">Smart Matching</span>
                  </div>
                </MotionReveal>
              </div>

              {/* Right side “preview” card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="card overflow-hidden shadow-2xl border-none p-1 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-gold/10 animate-floaty"
              >

                <div className="bg-gradient-to-br from-white/90 via-white/60 to-white/30 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 h-full border border-white/40">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5">
                    <div>
                      <div className="text-lg font-bold text-slate-900 leading-none">Today’s highlights</div>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600 uppercase tracking-wider border border-red-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {highlights.length > 0 ? (
                        highlights.map((item, idx) => (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + idx * 0.1, duration: 0.4 }}
                            onClick={() => navigate(`/items/${item.id}`)}
                            className="w-full text-left group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-brand-blue/20 hover:shadow-md transition-all active:scale-[0.99]"
                          >

                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0 pr-4">
                                <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors truncate">
                                  {item.title}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  <span className={item.status === 'Found' ? 'text-green-600' : 'text-brand-blue'}>
                                    {item.status}
                                  </span>
                                  <span>•</span>
                                  <span className="truncate">{item.category || 'Item'}</span>
                                  <span>•</span>
                                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all">
                                🔎
                              </div>
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        <div className="py-12 text-center">
                          <div className="text-4xl mb-3">📍</div>
                          <div className="text-sm font-bold text-slate-900">No recent activity</div>
                          <p className="text-xs text-slate-500 mt-1">Be the first to report something!</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 rounded-3xl bg-brand-blue p-6 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                      <div className="text-sm font-extrabold tracking-tight">Auto-match notifications</div>
                      <p className="mt-2 text-xs text-white/80 leading-relaxed font-medium">
                        When someone reports a similar item, Bear Tracks can nudge both posts to connect.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* HOW IT WORKS */}
        <HowItWorksSection />

        {/* STATS */}
        <Section id="stats" className="bg-vibrant-gold relative overflow-hidden border-y border-brand-orange/20 shadow-inner">
          <Container>
            <MotionReveal>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#5d3000] sm:text-5xl">Our impact</h2>
              <p className="mt-3 text-lg text-[#7c4100] max-w-2xl font-black">
                Real-time metrics from the Bear Tracks platform.
              </p>
            </MotionReveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Items returned", value: 1287, suffix: "+" },
                { label: "Avg. time to match", value: 3.2, decimals: 1, suffix: " days" },
                { label: "Reports this week", value: 94 },
                { label: "Matches suggested", value: 312 }
              ].map((stat, idx) => (
                <MotionReveal key={stat.label} delay={idx * 0.1} y={20}>
                  <StatCard {...stat} />
                </MotionReveal>
              ))}
            </div>
          </Container>
        </Section>


        {/* FAQ */}
        <Section id="faq" className="bg-vibrant-blue border-b border-brand-blue/20 shadow-inner">
          <Container>
            <MotionReveal>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#062d78] sm:text-5xl">Common questions</h2>
              <p className="mt-3 text-lg text-[#083796] max-w-2xl font-black">
                Everything you need to know about using Bear Tracks.
              </p>
            </MotionReveal>

            <div className="mt-10 grid gap-4">
              {[
                { q: "Do I need an account to browse items?", a: "Nope — browsing is open. You only need an account to submit a lost/found post." },
                { q: "Can I add a photo?", a: "Yes. The submit form supports photos and shows a preview before you post." },
                { q: "Is this connected to a real backend?", a: "Yes! We use Supabase for real-time updates and secure data storage." }
              ].map((item, idx) => (
                <MotionReveal key={item.q} delay={idx * 0.1} y={15}>
                  <FAQItem q={item.q}>
                    {item.a}
                  </FAQItem>
                </MotionReveal>
              ))}
            </div>
          </Container>
        </Section>


        {/* CONTACT / CTA */}
        <Section id="contact" className="relative overflow-hidden bg-brand-blue/10 py-24 sm:py-32">
          {/* Decorative Blobs for Contact Section */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"
          />

          <Container className="relative z-10">
            <MotionReveal className="mx-auto max-w-3xl">
              <ContactForm />
            </MotionReveal>
          </Container>
        </Section>


        <footer className="py-12 border-t border-slate-100">
          <Container>
            <div className="flex flex-col items-center justify-between gap-6 text-sm font-bold text-slate-400 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-blue" />
                © {new Date().getFullYear()} Bear Tracks
              </div>
              <div className="flex gap-8">
                <a className="hover:text-brand-blue transition-colors uppercase tracking-widest text-[10px]" href="#top">
                  Scroll To Top
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
    <Section id="how" className="relative overflow-hidden">
      {/* Decorative Blobs for How It Works Section */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 translate-x-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none"
      />

      <Container className="relative z-10">

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
