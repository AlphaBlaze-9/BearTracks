import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

/**
 * HowItWorks
 * ----------
 * A dynamic, interactive slideshow that auto-plays when in view.
 * Designed to feel like a premium, automated presentation of the product flow.
 */
export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1) // Always start with forward direction
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const sectionRef = useRef(null)

  // amount: 0.1 ensures it starts as soon as a small portion is visible
  const isInView = useInView(sectionRef, { amount: 0.1, once: false })

  const steps = [
    {
      title: 'Post',
      body: 'Take a quick photo, choose a category, and drop a short description.',
      icon: '📝',
      color: 'from-orange-400 to-orange-600',
    },
    {
      title: 'Match',
      body: 'Students browse and filter. Clear location tags make it easy to narrow down.',
      icon: '🔎',
      color: 'from-blue-500 to-blue-700',
    },
    {
      title: 'Verify',
      body: 'The claimant answers a simple verification prompt to confirm ownership.',
      icon: '🧾',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Pick up',
      body: 'Pickup instructions are shown clearly (office hours, contact, drop spot).',
      icon: '🤝',
      color: 'from-blue-400 to-indigo-600',
    },
  ]

  useEffect(() => {
    let interval
    if (isInView && isAutoPlaying) {
      interval = setInterval(() => {
        setDirection(1)
        setActiveIndex((prev) => (prev + 1) % steps.length)
      }, 4500) // Slightly longer to allow reading
    }
    return () => clearInterval(interval)
  }, [isInView, isAutoPlaying, steps.length])

  const handleStepClick = (index) => {
    if (index === activeIndex) return
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
    setIsAutoPlaying(false) // Manual control takes over
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 150 : -150,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 150 : -150,
      opacity: 0,
      scale: 1.2,
    }),
  }

  return (
    <section id="how" ref={sectionRef} className="relative overflow-hidden py-32 mt-20">
      {/* Background ambient glow - significantly larger and softer */}
      <div className="absolute inset-0 pointer-events-none opacity-25 transition-all duration-1000 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] bg-gradient-to-r ${steps[activeIndex].color}`} />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black tracking-tight md:text-7xl text-white"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-6 mx-auto max-w-2xl text-xl text-white/50"
          >
            The smartest way to recover lost items on campus.
          </motion.p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Visual Display side - The Slideshow */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-[4rem] bg-white/[0.03] p-6 ring-1 ring-white/10 backdrop-blur-3xl shadow-2xl">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 260, damping: 20 },
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.5 }
                  }}
                  className={`flex h-full w-full flex-col items-center justify-center rounded-[3.5rem] bg-gradient-to-br ${steps[activeIndex].color} shadow-2xl p-8`}
                >
                  <motion.span
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[160px] md:text-[220px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  >
                    {steps[activeIndex].icon}
                  </motion.span>

                  {/* Mobile-only content display */}
                  <div className="mt-8 text-center text-white md:hidden">
                    <h3 className="text-3xl font-bold">{steps[activeIndex].title}</h3>
                    <p className="mt-3 text-lg text-white/90 leading-relaxed px-4">{steps[activeIndex].body}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Steps list side */}
          <div className="order-1 lg:order-2 space-y-6">
            {steps.map((s, i) => (
              <button
                key={s.title}
                onClick={() => handleStepClick(i)}
                className={`group relative text-left w-full transition-all duration-500 ${activeIndex === i ? 'scale-105' : 'opacity-30 hover:opacity-100'
                  }`}
              >
                <div className={`glass relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 ${activeIndex === i ? 'ring-2 ring-white/40 shadow-2xl bg-white/[0.12]' : 'border border-white/5'
                  }`}>
                  {/* Progress bar with smooth linear animation */}
                  <AnimatePresence>
                    {activeIndex === i && isAutoPlaying && isInView && (
                      <motion.div
                        key="progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.5, ease: "linear" }}
                        className={`absolute bottom-0 left-0 h-2 bg-gradient-to-r ${s.color}`}
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-8">
                    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-4xl transition-all duration-500 shadow-inner ${activeIndex === i ? 'scale-110 rotate-6 bg-white/20' : 'group-hover:rotate-3'
                      }`}>
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-3xl font-extrabold transition-colors ${activeIndex === i ? 'text-white' : 'text-white/60'}`}>
                        {s.title}
                      </h3>
                      <AnimatePresence mode="wait">
                        {activeIndex === i && (
                          <motion.p
                            initial={{ height: 0, opacity: 0, y: -10 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="mt-3 text-xl text-white/60 leading-relaxed max-w-lg hidden md:block"
                          >
                            {s.body}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
