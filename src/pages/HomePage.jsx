// HomePage.jsx: Main landing page for the Bear Tracks lost & found platform.
// Contains the hero section with parallax video, a "How It Works" interactive carousel,
// platform statistics, an FAQ accordion, a contact form, and the site footer.

import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import StatCard from "../components/StatCard.jsx";
import FAQItem from "../components/FAQItem.jsx";
import ContactForm from "../components/ContactForm.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import heroVideo from "../FBLA Digital Video Production.mov";


export default function HomePage() {
  // Access the live item list to populate the hero "Today's Highlights" preview card
  const { items } = useItems();
  const navigate = useNavigate();

  // Ref for the hero section — used to track scroll position for the parallax effect
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // As the user scrolls through the hero (progress 0→1), shift the video downward by 30%
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  // Slight scale-up prevents white gaps from appearing as the video translates down
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Video source state — populated after loading from the Cache API or fetching fresh
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    // Attempt to serve the hero video from the Cache API to avoid re-downloading on each visit
    async function loadVideo() {
      try {
        const cacheName = "beartracks-video-cache-v1";
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(heroVideo);

        if (cachedResponse) {
          // Cache hit — create a local object URL from the cached blob
          const blob = await cachedResponse.blob();
          setVideoSrc(URL.createObjectURL(blob));
        } else {
          // Cache miss — fetch the video, store it for future visits, then create an object URL
          const response = await fetch(heroVideo);
          if (response.ok) {
            await cache.put(heroVideo, response.clone());
            const blob = await response.blob();
            setVideoSrc(URL.createObjectURL(blob));
          } else {
            // Fallback: point the video element directly at the bundled asset URL
            setVideoSrc(heroVideo);
          }
        }
      } catch (error) {
        console.error("Error loading cached video:", error);
        // Fallback to the direct asset URL if the Cache API is unavailable
        setVideoSrc(heroVideo);
      }
    }

    loadVideo();
  }, []);

  // Get the 3 most recently submitted items for the live highlights preview card
  const highlights = (items || []).slice(0, 3);

  return (
    <div id="top" className="min-h-screen bg-hero">
      <main>

        {/* ══════════════════════════════════════════════ */}
        {/*  HERO SECTION                                  */}
        {/* ══════════════════════════════════════════════ */}
        <Section
          ref={heroRef}
          className="relative pt-16 sm:pt-20 overflow-hidden min-h-[600px] flex items-center"
        >
          {/* ── Parallax Video Background ── */}
          {/* The motion.div translates and scales the video as the page scrolls */}
          <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
            {videoSrc && (
              <video
                autoPlay={localStorage.getItem('accessAid_pauseAnimations') !== 'true'}
                muted
                loop
                playsInline
                aria-label="Background video showing students on campus using the Bear Tracks app"
                className="h-full w-full object-cover"
                src={videoSrc}
                onLoadedMetadata={(e) => {
                  // Respect the accessibility setting to pause animations — seek to frame 1 instead
                  if (localStorage.getItem('accessAid_pauseAnimations') === 'true') {
                    e.target.currentTime = 1;
                  }
                }}
                onTimeUpdate={(e) => {
                  // Loop only the first 10 seconds of the video for a tighter cinematic loop
                  if (e.target.currentTime > 10) {
                    e.target.currentTime = 0;
                  }
                }}
              />
            )}
            {/* Minimal brand-tinted overlay — keeps the video vivid without heavy darkening */}
            <div className="absolute inset-0 bg-brand-blue/[0.02]" />
          </motion.div>

          {/* ── Hero Content Grid ── */}
          {/* Two-column layout: text/CTA card on the left, live preview card on the right */}
          <Container className="relative z-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

              {/* ── Left Column: Headline, Description, and CTA Buttons ── */}
              <div className="glass-light p-8 rounded-[40px] shadow-2xl border border-white/30 backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/50 to-white/20 max-w-2xl">
                <MotionReveal>
                  <div className="flex flex-col gap-2">
                    {/* Announcement pill — highlights the latest platform improvements */}
                    <p className="pill inline-flex items-center gap-2 text-xs text-slate-900 font-bold bg-white/60 backdrop-blur-sm border border-white/40 self-start">
                      <span className="inline-flex h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
                      New: faster reporting + smarter matching
                    </p>
                    {/* Brand identifier badge — school name and system label */}
                    <p className="inline-flex items-center gap-2.5 self-start rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-black text-white uppercase tracking-widest shadow-md shadow-brand-blue/30">
                      <span className="text-lg">🐻</span> Bridgeland High School Lost &amp; Found System
                    </p>
                  </div>
                </MotionReveal>

                {/* Main headline — introduced with a slight stagger delay for the entrance animation */}
                <MotionReveal delay={0.05}>
                  <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 leading-[1.1]">
                    Lost something <br />
                    <span className="text-brand-blue">at school?</span>
                    <span className="block text-slate-800 text-3xl sm:text-4xl mt-2 font-semibold">
                      Find it faster with Bear Tracks.
                    </span>
                  </h1>
                  <p className="mt-3 text-lg sm:text-xl font-bold text-brand-blue">
                    Bridgeland High School&apos;s official lost &amp; found system.
                  </p>
                </MotionReveal>

                {/* Supporting body copy — describes the platform's key value proposition */}
                <MotionReveal delay={0.1}>
                  <p className="mt-6 max-w-xl text-lg text-slate-800 leading-relaxed font-semibold">
                    A clean, student-friendly experience built just for BHS.
                    Report items in seconds, browse verified posts, and get
                    notified when matches show up.
                  </p>
                </MotionReveal>

                {/* Primary CTA buttons — Report an item (solid) and Browse items (outline) */}
                <MotionReveal delay={0.15}>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link
                      to="/submit"
                      aria-label="Report a lost or found item"
                      className="rounded-2xl bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                      Report an item
                    </Link>
                    <Link
                      to="/browse"
                      aria-label="Browse lost and found item listings"
                      className="rounded-2xl border-2 border-brand-blue/10 bg-white/80 backdrop-blur px-8 py-4 text-sm font-bold text-slate-900 hover:bg-white/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                      Browse items
                    </Link>
                  </div>
                </MotionReveal>

                {/* Feature pills — quick summary of key platform capabilities */}
                <MotionReveal delay={0.2}>
                  <div className="mt-10 flex flex-wrap gap-3 text-xs font-bold text-slate-700 uppercase tracking-widest">
                    <span className="pill bg-white/40 backdrop-blur-sm">
                      Public Browsing
                    </span>
                    <span className="pill bg-white/40 backdrop-blur-sm">
                      Mobile Optimized
                    </span>
                    <span className="pill bg-white/40 backdrop-blur-sm">
                      Smart Matching
                    </span>
                  </div>
                </MotionReveal>
              </div>

              {/* ── Right Column: Live Highlights Preview Card ── */}
              {/* Floats gently using the `animate-floaty` Tailwind utility keyframe */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="card overflow-hidden shadow-2xl border-none p-1 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-gold/10 animate-floaty"
              >
                <div className="bg-gradient-to-br from-white/90 via-white/60 to-white/30 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 h-full border border-white/40">
                  {/* Card header — title on the left, "Live" pulse indicator on the right */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5">
                    <div>
                      <div className="text-lg font-bold text-slate-900 leading-none">
                        Today's highlights
                      </div>
                    </div>
                    {/* Animated red pulse dot signals real-time data from the database */}
                    <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600 uppercase tracking-wider border border-red-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                      Live
                    </span>
                  </div>

                  {/* ── Recent Item List ── */}
                  {/* Shows the 3 most recently submitted items as clickable mini-cards */}
                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {highlights.length > 0 ? (
                        highlights.map((item, idx) => (
                          // Each row animates in with a staggered delay based on its index
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: 0.1 + idx * 0.1,
                              duration: 0.4,
                            }}
                            onClick={() => navigate(`/items/${item.id}`)}
                            aria-label={`View details for ${item.title}`}
                            className="w-full text-left group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-brand-blue/20 hover:shadow-md transition-all active:scale-[0.99]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0 pr-4">
                                {/* Item title — truncated with a hover color transition */}
                                <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors truncate">
                                  {item.title}
                                </div>
                                {/* Meta row: status, category, and submission date */}
                                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  <span
                                    className={
                                      item.status === "Found"
                                        ? "text-green-600"
                                        : "text-brand-blue"
                                    }
                                  >
                                    {item.status}
                                  </span>
                                  <span>•</span>
                                  <span className="truncate">
                                    {item.category || "Item"}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {new Date(
                                      item.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {/* Search icon chip — highlights on hover to signal interactivity */}
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all">
                                🔎
                              </div>
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        // Empty state — shown when no items have been submitted yet
                        <div className="py-12 text-center">
                          <div className="text-4xl mb-3">📍</div>
                          <div className="text-sm font-bold text-slate-900">
                            No recent activity
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Be the first to report something!
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Auto-match feature callout — explains the smart notification capability */}
                  <div className="mt-8 rounded-3xl bg-brand-blue p-6 text-white overflow-hidden relative group">
                    {/* Decorative blob that expands on hover for a subtle interactive effect */}
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                      <div className="text-sm font-extrabold tracking-tight">
                        Auto-match notifications
                      </div>
                      <p className="mt-2 text-xs text-white/80 leading-relaxed font-medium">
                        When someone reports a similar item, Bear Tracks can
                        nudge both posts to connect.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* ══════════════════════════════════════════════ */}
        {/*  HOW IT WORKS SECTION (interactive carousel)  */}
        {/* ══════════════════════════════════════════════ */}
        <HowItWorksSection />

        {/* ══════════════════════════════════════════════ */}
        {/*  PLATFORM STATISTICS SECTION                  */}
        {/* ══════════════════════════════════════════════ */}
        <Section
          id="stats"
          className="bg-vibrant-gold relative overflow-hidden border-y border-brand-orange/20 shadow-inner"
        >
          <Container>
            <MotionReveal>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#5d3000] sm:text-5xl">
                Our impact
              </h2>
              <p className="mt-3 text-lg text-[#7c4100] max-w-2xl font-black">
                Real-time metrics from the Bear Tracks platform.
              </p>
            </MotionReveal>

            {/* Four stat cards — each animates in with a slight cascade delay */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Items returned", value: 42, suffix: "+" },
                {
                  label: "Avg. time to match",
                  value: 2.5,
                  decimals: 1,
                  suffix: " days",
                },
                { label: "Reports this week", value: 12 },
                { label: "Matches suggested", value: 18 },
              ].map((stat, idx) => (
                // StatCard handles the animated count-up logic internally
                <MotionReveal key={stat.label} delay={idx * 0.1} y={20}>
                  <StatCard {...stat} />
                </MotionReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ══════════════════════════════════════════════ */}
        {/*  FAQ SECTION                                   */}
        {/* ══════════════════════════════════════════════ */}
        <Section
          id="faq"
          className="bg-vibrant-blue border-b border-brand-blue/20 shadow-inner"
        >
          <Container>
            <MotionReveal>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#062d78] sm:text-5xl">
                Common questions
              </h2>
              <p className="mt-3 text-lg text-[#083796] max-w-2xl font-black">
                Everything you need to know about using Bear Tracks.
              </p>
            </MotionReveal>

            {/* FAQ accordion items — each expands on click to reveal the answer */}
            <div className="mt-10 grid gap-4">
              {[
                {
                  q: "I lost an item. What should I do?",
                  a: "Log in and submit a 'Lost' report with a description and optional photo. We'll notify you if we find a match.",
                },
                {
                  q: "How do I prove an item belongs to me?",
                  a: "Provide specific details (unique markings, serial numbers) or photos. Verification happens during the return process.",
                },
                {
                  q: "Where do I drop off an item I found?",
                  a: "Please bring found items to the main office or designated lost & found collection point on campus.",
                },
              ].map((item, idx) => (
                // Each FAQItem staggered in based on its index in the array
                <MotionReveal key={item.q} delay={idx * 0.1} y={15}>
                  <FAQItem question={item.q} answer={item.a} />
                </MotionReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ══════════════════════════════════════════════ */}
        {/*  CONTACT / CTA SECTION                        */}
        {/* ══════════════════════════════════════════════ */}
        <Section
          id="contact"
          className="relative overflow-hidden bg-brand-blue/10 py-24 sm:py-32"
        >
          {/* Animated decorative blobs — float slowly to add depth to the background */}
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

          {/* ContactForm handles submission logic and success/error feedback internally */}
          <Container className="relative z-10">
            <MotionReveal className="mx-auto max-w-3xl">
              <ContactForm />
            </MotionReveal>
          </Container>
        </Section>

        {/* ══════════════════════════════════════════════ */}
        {/*  SITE FOOTER                                   */}
        {/* ══════════════════════════════════════════════ */}
        {/* Minimal footer with copyright and quick links to citations and scroll-to-top */}
        <footer className="py-12 border-t border-slate-100" role="contentinfo" aria-label="Site Footer">
          <Container>
            <div className="flex flex-col items-center justify-between gap-6 text-sm font-bold text-slate-400 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-blue" />©{" "}
                {new Date().getFullYear()} Bear Tracks
              </div>
              <div className="flex gap-6 sm:gap-8 items-center">
                {/* Links to the Works Cited page — required for FBLA compliance */}
                <Link
                  className="hover:text-brand-blue transition-colors uppercase tracking-widest text-[10px]"
                  to="/citations"
                  aria-label="View works cited and citations"
                >
                  Works Cited
                </Link>
                {/* Anchor tag targets the #top id placed on the outermost div */}
                <a
                  className="hover:text-brand-blue transition-colors uppercase tracking-widest text-[10px]"
                  href="#top"
                  aria-label="Scroll back to top of page"
                >
                  Scroll To Top
                </a>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HowItWorksSection — Interactive 3D Carousel
//  Extracted as a separate component to keep HomePage readable.
//  Auto-rotates every 4 seconds; clicking a card resets the timer.
// ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  // Track which step is currently centered in the carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  // Step data — each step has a title, body copy, emoji icon, color classes, and gradient
  const steps = [
    {
      title: "Report",
      body: "Post a lost or found item. Our smart form makes it quick.",
      icon: "✍️",
      color: "bg-orange-100 text-orange-600",
      gradient: "from-orange-100 via-white to-orange-50",
    },
    {
      title: "Verify",
      body: "Moderators confirm the post to ensure accuracy.",
      icon: "✅",
      color: "bg-green-100 text-green-600",
      gradient: "from-green-100 via-white to-green-50",
    },
    {
      title: "Match",
      body: "Our system surfaces similar posts to reduce guesswork.",
      icon: "🧩",
      color: "bg-blue-100 text-blue-600",
      gradient: "from-blue-100 via-white to-blue-50",
    },
    {
      title: "Return",
      body: "Arrange a safe pickup and confirm the return.",
      icon: "🎒",
      color: "bg-purple-100 text-purple-600",
      gradient: "from-purple-100 via-white to-purple-50",
    },
  ];

  useEffect(() => {
    // Check the accessibility preference before starting the auto-rotation timer
    const shouldPause = localStorage.getItem('accessAid_pauseAnimations') === 'true';
    if (!shouldPause) {
      startTimer();
    }
    // Clear the interval on component unmount to prevent memory leaks
    return () => clearInterval(timerRef.current);
  }, []);

  // Starts (or resets) a 4-second interval that advances the carousel to the next step
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 4000);
  };

  // Handle a manual card click — set the active index and restart the auto-rotation timer
  const handleCardClick = (index) => {
    setActiveIndex(index);
    const shouldPause = localStorage.getItem('accessAid_pauseAnimations') === 'true';
    if (!shouldPause) {
      startTimer(); // Reset the auto-advance timer so the new card stays centered for a full interval
    }
  };

  // Map an absolute step index to a carousel position string based on its distance from activeIndex.
  // Positions: "center" (focused), "right" (+1), "left" (-1 / +3), "hidden" (+2, behind the active card)
  const getCardProps = (index) => {
    const diff = (index - activeIndex + steps.length) % steps.length;

    let position = "hidden";
    if (diff === 0) position = "center";
    else if (diff === 1) position = "right";
    else if (diff === 3) position = "left"; // Wrap-around: index 3 is logically -1 in a 4-step loop
    else position = "hidden"; // diff === 2: the card directly "behind" the active one

    return position;
  };

  // Framer Motion variant map — each position defines a transform, scale, opacity, and z-index
  // Cards are spread 85% apart horizontally so left/right cards are visible but clearly secondary
  const variants = {
    center: { x: "0%", scale: 1, opacity: 1, zIndex: 20 },
    left: { x: "-85%", scale: 0.8, opacity: 0.4, zIndex: 10 },
    right: { x: "85%", scale: 0.8, opacity: 0.4, zIndex: 10 },
    hidden: { x: "0%", scale: 0.5, opacity: 0, zIndex: 0 },
  };

  return (
    <Section
      id="how"
      className="relative overflow-hidden py-24 bg-vibrant-mixed border-y border-brand-blue/10"
    >
      <Container className="relative z-10">
        {/* Section heading and subtext */}
        <MotionReveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Four simple steps to get items back where they belong.
            </p>
          </div>
        </MotionReveal>

        {/* ── 3D Carousel Container ── */}
        {/* perspective-[1000px] gives the surrounding context the CSS 3D perspective needed for depth */}
        <div className="relative h-[450px] w-full max-w-5xl mx-auto flex items-center justify-center perspective-[1000px]" role="region" aria-label="How it works interactive guide" aria-roledescription="carousel">
          <AnimatePresence mode="popLayout" initial={false}>
            {steps.map((step, idx) => {
              const position = getCardProps(idx);

              return (
                // Each card animates to its computed position using the variants map above
                <motion.div
                  key={step.title}
                  variants={variants}
                  initial={false}
                  animate={position}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  onClick={() => handleCardClick(idx)}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Step ${idx + 1} of ${steps.length}: ${step.title}`}
                  aria-hidden={position === "hidden"}
                  className={`absolute w-[320px] sm:w-[400px] cursor-pointer`}
                >
                  <div
                    className={`
                    relative overflow-hidden rounded-[2.5rem] p-8 h-[400px] flex flex-col items-center text-center
                    transition-all duration-300 shadow-2xl
                    bg-gradient-to-br ${step.gradient} border border-white/60
                    ${position === "center" ? "ring-4 ring-brand-blue/10 scale-100 opacity-100" : "grayscale-[0.2] opacity-100"}
                  `}
                  >
                    <div className="mt-8 flex-1 flex flex-col items-center justify-center">
                      {/* Step icon — rendered inside a frosted glass badge */}
                      <div
                        className={`mb-8 inline-flex h-24 w-24 items-center justify-center rounded-[2rem] text-5xl shadow-xl shadow-black/10 bg-white/60 backdrop-blur-sm ${step.color.replace("bg-", "text-").replace("text-", "text-opacity-100 ")}`}
                      >
                        {step.icon}
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-slate-900 leading-relaxed font-semibold">
                        {step.body}
                      </p>
                    </div>

                    {/* Step number label pinned to the bottom of each card */}
                    <div className="absolute bottom-6 font-bold text-xs uppercase tracking-widest text-slate-900/60">
                      Step 0{idx + 1}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Dot Indicators ── */}
        {/* Clicking a dot jumps directly to that step and resets the auto-rotation timer */}
        <div className="flex justify-center gap-3 mt-12" role="tablist" aria-label="Carousel slide selectors">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Step ${idx + 1}: ${step.title}`}
              // Active dot is wider and brand-colored; inactive dots are small and gray
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx
                ? "w-8 bg-brand-blue"
                : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
