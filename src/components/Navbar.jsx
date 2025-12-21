import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Container from './Container.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Navbar
 * ------
 * Updated for multi-page routing.
 *
 * Design goals:
 * - keep the same vibe as your original landing page
 * - add Browse + Submit pages
 * - show Login/Signup when signed out
 * - show Logout when signed in
 */

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

function useScrollShadow() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return scrolled
}

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth()
  const scrolled = useScrollShadow()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close the mobile menu when the route changes (so it doesn't "stick" open)
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  function goHomeAndScroll(id) {
    // If you're already on home, we can scroll immediately.
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // If not on home, navigate first, then scroll after paint.
    navigate('/')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  const desktopLink = ({ isActive }) =>
    cx(
      'rounded-full px-3 py-2 text-sm text-slate-700 hover:bg-brand-gold/15',
      isActive ? 'bg-brand-gold/15 text-slate-900' : ''
    )

  return (
    <header
      className={
        'sticky top-0 z-50 border-b border-brand-blue/15 bg-white/75 backdrop-blur ' +
        (scrolled ? 'shadow-soft' : '')
      }
    >
      <Container className="py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue text-white">
              🐻
            </span>
            <div className="leading-tight">
              <div className="text-base font-semibold">Bear Tracks</div>
              <div className="text-xs text-slate-500">School Lost &amp; Found</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={desktopLink} end>
              Home
            </NavLink>
            <NavLink to="/browse" className={desktopLink}>
              Browse
            </NavLink>
            <NavLink to="/submit" className={desktopLink}>
              Submit
            </NavLink>

            <button
              type="button"
              onClick={() => goHomeAndScroll('faq')}
              className="rounded-full px-3 py-2 text-sm text-slate-700 hover:bg-brand-gold/15"
            >
              FAQ
            </button>

            {!isAuthed ? (
              <div className="ml-2 flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="rounded-full border border-brand-blue/15 bg-white/60 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white/80"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-full bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-dark"
                >
                  Sign up
                </NavLink>
              </div>
            ) : (
              <div className="ml-3 flex items-center gap-2">
                <span className="hidden text-sm text-slate-600 sm:inline">Hi, {user.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-brand-blue/15 bg-white/60 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white/80"
                >
                  Log out
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-xl border border-brand-blue/15 bg-white/60 px-3 py-2 text-sm"
            onClick={() => setIsOpen((s) => !s)}
            aria-expanded={isOpen}
            aria-label="Open menu"
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-brand-blue/15 bg-white/65 backdrop-blur"
          >
            <Container className="py-3">
              <div className="flex flex-col gap-1">
                <NavLink to="/" className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-brand-gold/15" end>
                  Home
                </NavLink>
                <NavLink
                  to="/browse"
                  className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-brand-gold/15"
                >
                  Browse
                </NavLink>
                <NavLink
                  to="/submit"
                  className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-brand-gold/15"
                >
                  Submit
                </NavLink>

                <button
                  type="button"
                  onClick={() => goHomeAndScroll('faq')}
                  className="rounded-xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-brand-gold/15"
                >
                  FAQ
                </button>

                {!isAuthed ? (
                  <div className="mt-2 grid gap-2">
                    <NavLink
                      to="/login"
                      className="rounded-xl border border-brand-blue/15 bg-white/60 px-3 py-3 text-center text-sm font-medium text-slate-900"
                    >
                      Log in
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className="rounded-xl bg-brand-blue px-3 py-3 text-center text-sm font-medium text-white"
                    >
                      Sign up
                    </NavLink>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-2 rounded-xl border border-brand-blue/15 bg-white/60 px-3 py-3 text-center text-sm font-medium text-slate-900"
                  >
                    Log out
                  </button>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
