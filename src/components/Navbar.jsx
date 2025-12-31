import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Container from './Container.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import DeleteAccountModal from './DeleteAccountModal.jsx'

import BearTracksLogo from '../BearTracksLogo.png'

/**
 * Navbar
 * ------
 * Updated for multi-page routing.
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
  const { isAuthed, user, logout, deleteAccount } = useAuth()
  const scrolled = useScrollShadow()
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsOpen(false)
    setIsAccountMenuOpen(false)
  }, [location.pathname])

  function goHomeAndScroll(id) {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    navigate('/')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm('Are you sure? All your submitted items will be permanently deleted.')
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteAccount()
      alert('Account deleted.')
      navigate('/')
    } catch (err) {
      console.error('Delete error:', err)
      alert(err.message || 'Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const desktopLink = ({ isActive }) =>
    cx(
      'rounded-full px-3 py-2 text-sm font-extrabold text-[#062d78] hover:bg-brand-gold/20 transition-colors',
      isActive ? 'bg-brand-gold/25 text-[#062d78] shadow-sm' : ''
    )

  return (
    <header
      className={
        'sticky top-0 z-50 border-b border-brand-blue/20 bg-brand-blue/15 backdrop-blur-lg transition-all ' +
        (scrolled ? 'shadow-soft bg-brand-blue/25' : '')
      }
    >
      <Container className="py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={BearTracksLogo}
              alt="Bear Tracks Logo"
              className="h-14 w-auto object-contain"
            />
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
              className="rounded-full px-4 py-2 text-sm font-extrabold text-[#062d78] hover:bg-brand-gold/15 transition-all"
            >
              FAQ
            </button>

            {!isAuthed ? (
              <div className="ml-2 flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="rounded-full border border-brand-orange/20 bg-brand-orange/10 px-5 py-2 text-sm font-black text-[#ea580c] hover:bg-brand-orange/20 transition-all shadow-sm"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-full bg-brand-orange px-5 py-2 text-sm font-bold text-white hover:bg-[#ea580c] transition-all shadow-md shadow-brand-orange/20"
                >
                  Sign up
                </NavLink>
              </div>
            ) : (
              <div className="relative ml-3">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-3 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-sm font-black text-[#062d78] hover:bg-brand-blue/20 transition-all"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  <svg
                    className={cx('h-4 w-4 transition-transform', isAccountMenuOpen ? 'rotate-180' : '')}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5"
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Account
                        </div>
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Log out
                        </button>
                        <div className="my-1 h-px bg-slate-100" />
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false)
                            handleDeleteAccount()
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Delete Account
                        </button>
                      </motion.div>
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsAccountMenuOpen(false)} />
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-3 py-2 text-sm font-black text-[#062d78]"
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
                  className="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-brand-gold/15"
                >
                  FAQ
                </button>

                {!isAuthed ? (
                  <div className="mt-2 grid gap-2">
                    <NavLink
                      to="/login"
                      className="rounded-xl border border-brand-orange/15 bg-white/60 px-3 py-3 text-center text-sm font-medium text-slate-900"
                    >
                      Log in
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className="rounded-xl bg-brand-orange px-3 py-3 text-center text-sm font-medium text-white"
                    >
                      Sign up
                    </NavLink>
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2">
                    <button
                      type="button"
                      onClick={logout}
                      className="rounded-xl border border-brand-blue/15 bg-white/60 px-3 py-3 text-center text-sm font-medium text-slate-900"
                    >
                      Log out
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        handleDeleteAccount()
                      }}
                      className="rounded-xl bg-red-50 px-3 py-3 text-center text-sm font-bold text-red-500"
                    >
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
