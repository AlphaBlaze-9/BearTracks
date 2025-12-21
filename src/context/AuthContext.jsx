import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readJSON, remove, writeJSON } from '../lib/storage.js'

/**
 * AuthContext (mock auth)
 * ----------------------
 * This is intentionally "fake" authentication.
 *
 * What it does:
 * - Stores users + a "current session" in localStorage.
 * - Lets you develop gated UI flows (login required to submit items).
 *
 * What it does NOT do:
 * - Secure password handling
 * - Server-side validation
 *
 * When you're ready to hook up a real service:
 * - Replace the functions in this file with API calls.
 * - Keep the rest of the app unchanged.
 */

const AuthContext = createContext(null)

const USERS_KEY = 'bt_users'
const SESSION_KEY = 'bt_session'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // On refresh, load the session (if any)
    const session = readJSON(SESSION_KEY, null)
    setUser(session?.user ?? null)
  }, [])

  const value = useMemo(() => {
    function signup({ name, email, password }) {
      const users = readJSON(USERS_KEY, [])
      const e = normalizeEmail(email)
      if (!e) throw new Error('Email is required.')
      if (users.some((u) => normalizeEmail(u.email) === e)) {
        throw new Error('An account with that email already exists.')
      }

      // NOTE: storing passwords like this is NOT secure.
      // This is only for your prototype. Swap to a real auth provider later.
      const newUser = { id: crypto.randomUUID(), name: name?.trim() || 'Student', email: e, password }
      writeJSON(USERS_KEY, [...users, newUser])

      // Auto-login after signup
      const session = { user: { id: newUser.id, name: newUser.name, email: newUser.email } }
      writeJSON(SESSION_KEY, session)
      setUser(session.user)
      return session.user
    }

    function login({ email, password }) {
      const users = readJSON(USERS_KEY, [])
      const e = normalizeEmail(email)
      const found = users.find((u) => normalizeEmail(u.email) === e)
      if (!found || found.password !== password) {
        throw new Error('Invalid email or password.')
      }
      const session = { user: { id: found.id, name: found.name, email: found.email } }
      writeJSON(SESSION_KEY, session)
      setUser(session.user)
      return session.user
    }

    function logout() {
      remove(SESSION_KEY)
      setUser(null)
    }

    return {
      user,
      isAuthed: Boolean(user),
      signup,
      login,
      logout,
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.')
  return ctx
}
