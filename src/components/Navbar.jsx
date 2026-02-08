import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Container from './Container.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useItems } from '../context/ItemsContext.jsx'
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
  const { items } = useItems()
  const scrolled = useScrollShadow()
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [readNotifs, setReadNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('read_notifications')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
      alert('Failed to log out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Calculate notifications: Lost items by this user that have matches
  const notifications = isAuthed && user ? items.filter(it =>
    it.user_id === user.id &&
    it.status === 'Lost' &&
    it.potential_matches &&
    it.potential_matches.length > 0 &&
    !readNotifs.includes(it.id)
  ) : []

  function handleNotificationClick(itemId) {
    setIsNotifOpen(false)
    if (!readNotifs.includes(itemId)) {
      const newRead = [...readNotifs, itemId]
      setReadNotifs(newRead)
      localStorage.setItem('read_notifications', JSON.stringify(newRead))
    }
  }
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
            <span className="font-black text-xl text-[#062d78] tracking-tight hidden sm:block">
              BearTracks
            </span>
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

            {isAuthed && (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative flex items-center justify-center h-10 w-10 rounded-full border border-brand-blue/20 bg-brand-blue/10 text-[#062d78] hover:bg-brand-blue/20 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50"
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-2">
                          Notifications
                        </div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-slate-500 font-medium">
                            No new alerts
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
                            {notifications.map(item => (
                              <Link
                                key={item.id}
                                to={`/items/${item.id}`}
                                onClick={() => handleNotificationClick(item.id)}
                                className="block rounded-xl bg-brand-blue/5 p-3 hover:bg-brand-blue/10 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="text-brand-blue pt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM11.38 15.023l3.6-4.5a.75.75 0 0 1 1.14.954l-4.12 5.15a.75.75 0 0 1-1.122.046L7.385 13.06a.75.75 0 1 1 1.13-1.02l2.865 3.01.001-.027Z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-[#062d78]">Match Found!</div>
                                    <div className="text-xs text-slate-600 line-clamp-1">
                                      Possible match for "{item.title}"
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </motion.div>
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsNotifOpen(false)} />
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

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
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? 'Logging out...' : 'Log out'}
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
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="rounded-xl border border-brand-blue/15 bg-white/60 px-3 py-3 text-center text-sm font-medium text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? 'Logging out...' : 'Log out'}
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
