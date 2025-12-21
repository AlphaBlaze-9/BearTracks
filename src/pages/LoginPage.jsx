import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * LoginPage
 * ---------
 * Frontend-only login.
 *
 * If the user was redirected here by a protected page, we send them back.
 */

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const from = location.state?.from || '/'

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      login({ email, password })
      navigate(from)
    } catch (err) {
      setError(err.message || 'Login failed.')
    }
  }

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-10">
        <Container>
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
            <p className="mt-2 text-sm text-slate-600">
              This is a placeholder auth flow (localStorage). You’ll connect it to a real service later.
            </p>

            <div className="mt-6 card p-6">
              <form onSubmit={onSubmit} className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@school.edu"
                    className="mt-2 input-field"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="mt-2 input-field"
                  />
                </div>

                {error && <div className="rounded-2xl bg-brand-orange/15 p-3 text-sm text-slate-800">{error}</div>}

                <button
                  type="submit"
                  className="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-medium text-white hover:bg-brand-blue-dark"
                >
                  Log in
                </button>

                <p className="text-xs text-slate-500">
                  Don’t have an account?{' '}
                  <Link to="/signup" className="font-medium text-brand-blue hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
