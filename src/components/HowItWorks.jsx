import { Camera, Search, ShieldCheck, Handshake } from "lucide-react";

// Additional imports (motion, AnimatePresence, useRef, useState, useEffect, useInView, etc.)
// are referenced via the state/hook declarations below.
// ... imports

export default function HowItWorks() {
  // ── State & Refs ────────────────────────────────────────────────────────────
  // activeIndex   — which step (0–3) is currently highlighted in the slideshow
  // direction     — +1 for forward, -1 for backward, drives the slide enter/exit axis
  // isAutoPlaying — true by default; flips to false when the user clicks a step manually
  // hasDelayPassed — guards auto-play: we wait 2s after the section enters view before cycling
  // sectionRef / isInView — IntersectionObserver hook watching the section's visibility
  // ... state code ...

  // ── Step Definitions ────────────────────────────────────────────────────────
  // Each step has a title, body copy, icon, and gradient color used for both the
  // slideshow card background and the ambient glow behind the section.
  const steps = [
    {
      title: "Post",
      body: "Take a quick photo, choose a category, and drop a short description.",
      icon: <Camera className="w-full h-full p-4" strokeWidth={1.5} />,
      color: "from-orange-400 to-orange-600",
    },
    {
      title: "Match",
      body: "Students browse and filter. Clear location tags make it easy to narrow down.",
      icon: <Search className="w-full h-full p-4" strokeWidth={1.5} />,
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Verify",
      body: "The claimant answers a simple verification prompt to confirm ownership.",
      icon: <ShieldCheck className="w-full h-full p-4" strokeWidth={1.5} />,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Pick up",
      body: "Pickup instructions are shown clearly (office hours, contact, drop spot).",
      icon: <Handshake className="w-full h-full p-4" strokeWidth={1.5} />,
      color: "from-blue-400 to-indigo-600",
    },
  ];

  // ── Auto-play Delay Guard ───────────────────────────────────────────────────
  // Wait 2 seconds after the section scrolls into view before cycling begins.
  // This prevents the slideshow from immediately advancing the moment it appears.
  useEffect(() => {
    let timer;
    if (isInView) {
      timer = setTimeout(() => {
        setHasDelayPassed(true);
      }, 2000);
    } else {
      setHasDelayPassed(false);
    }
    return () => clearTimeout(timer);
  }, [isInView]);

  // ── Auto-play Interval ─────────────────────────────────────────────────────
  // Advances to the next step every 4.5 seconds, cycling through all four steps.
  // Interval is cleared when the section leaves view or the user takes manual control.
  useEffect(() => {
    let interval;
    if (isInView && isAutoPlaying && hasDelayPassed) {
      interval = setInterval(() => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % steps.length);
      }, 4500); // Slightly longer to allow reading
    }
    return () => clearInterval(interval);
  }, [isInView, isAutoPlaying, hasDelayPassed, steps.length]);

  // handleStepClick: switches the slideshow to the clicked step and disables auto-play
  // so the user's selection persists until they navigate away.
  const handleStepClick = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsAutoPlaying(false); // Manual control takes over
  };

  // ── Framer Motion Variants ─────────────────────────────────────────────────
  // The custom(direction) function receives the direction value passed to AnimatePresence.
  // Positive direction = slide in from the right; negative = slide in from the left.
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
  };

  return (
    <section
      id="how"
      ref={sectionRef}
      className="relative overflow-hidden py-32 mt-20"
    >
      {/* ── Ambient Background Glow ─────────────────────────────────────── */}
      {/* The glow color transitions to match the currently active step's gradient,
          giving the whole section a dynamic, reactive feel without re-rendering */}
      <div className="absolute inset-0 pointer-events-none opacity-25 transition-all duration-1000 overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] bg-gradient-to-r ${steps[activeIndex].color}`}
        />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">

        {/* ── Section Header ───────────────────────────────────────────── */}
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

        {/* ── Two-Column Layout: Slideshow | Steps List ────────────────── */}
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

          {/* ── Left: Animated Slideshow ──────────────────────────────── */}
          {/* order-2 on mobile so the steps list appears above the visual on small screens */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-[4rem] bg-white/[0.03] p-6 ring-1 ring-white/10 backdrop-blur-3xl shadow-2xl">
              {/* AnimatePresence with mode="wait" ensures the exiting slide fully leaves
                  before the entering slide begins — prevents two slides being visible at once */}
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
                    scale: { duration: 0.5 },
                  }}
                  className={`flex h-full w-full flex-col items-center justify-center rounded-[3.5rem] bg-gradient-to-br ${steps[activeIndex].color} shadow-2xl p-8`}
                >
                  {/* Icon floats on a gentle up-down loop to add life to the display */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-40 w-40 md:h-56 md:w-56 text-white drop-shadow-2xl"
                  >
                    {steps[activeIndex].icon}
                  </motion.div>

                  {/* Mobile-only: show the step title and body inside the slideshow card
                      since the steps list (right column) is reordered below on small screens */}
                  <div className="mt-8 text-center text-white md:hidden">
                    <h3 className="text-3xl font-bold">
                      {steps[activeIndex].title}
                    </h3>
                    <p className="mt-3 text-lg text-white/90 leading-relaxed px-4">
                      {steps[activeIndex].body}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right: Clickable Steps List ───────────────────────────── */}
          {/* Each step is a button; clicking it jumps the slideshow to that step */}
          <div className="order-1 lg:order-2 space-y-6">
            {steps.map((s, i) => (
              <button
                key={s.title}
                onClick={() => handleStepClick(i)}
                className={`group relative text-left w-full transition-all duration-500 ${
                  activeIndex === i
                    ? "scale-105"
                    : "opacity-30 hover:opacity-100"
                }`}
              >
                <div
                  className={`glass relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 ${
                    activeIndex === i
                      ? "ring-2 ring-white/40 shadow-2xl bg-white/[0.12]"
                      : "border border-white/5"
                  }`}
                >
                  {/* ── Auto-play Progress Bar ─────────────────────────── */}
                  {/* Animates from width:0 to width:100% over 4.5s matching the interval.
                      Only shown on the active step while auto-play is running and in view. */}
                  <AnimatePresence>
                    {activeIndex === i &&
                      isAutoPlaying &&
                      isInView &&
                      hasDelayPassed && (
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
                    {/* Step icon: slightly rotated and scaled when active for emphasis */}
                    <div
                      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-white transition-all duration-500 shadow-inner p-4 ${
                        activeIndex === i
                          ? "scale-110 rotate-6 bg-white/20"
                          : "group-hover:rotate-3"
                      }`}
                    >
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-3xl font-extrabold transition-colors ${activeIndex === i ? "text-white" : "text-white/60"}`}
                      >
                        {s.title}
                      </h3>
                      {/* Body text animates in/out with height to avoid layout jumps */}
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
  );
}
