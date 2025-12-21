import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * SignupPage
 * ----------
 * Frontend-only signup.
 *
 * Stores the new user in localStorage, then logs them in.
 */

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      signup({ name, email, password })
      navigate('/submit')
    } catch (err) {
      setError(err.message || 'Signup failed.')
    }
  }

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-10">
        <Container>
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create an account to submit lost/found posts. (No backend connected yet.)
            </p>

            <div className="mt-6 card p-6">
              <form onSubmit={onSubmit} className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Samarth"
                    className="mt-2 input-field"
                  />
                </div>

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
                  Create account
                </button>

                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-brand-blue hover:underline">
                    Log in
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
